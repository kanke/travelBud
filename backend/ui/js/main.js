(function() {
	
	var beacons = [];
	
	var onSubmit = function() {
		var uuid = $("#beacon-id").val();
		
		if (uuid) {
			console.log("Updating beacon " + uuid);
			console.log($("#safety").val());
			
			var request = $.ajax("beacon?uuid=" + uuid, {
				dataType: "json",
				method: "POST",
				data: {
					safety: $("#safety").val()
				}
			});
			
			request.done(function(data, status, hdr) {
				console.log("Request OK");
				console.log(data);
			});
			
			request.fail(function(hdr, status, error) {
				console.log("Request FAIL");
				console.log(error);
			});
		}
		else {
			console.log("No beacon selected");
		}
	};
	
	var onSelectBeacon = function() {
		var uuid = $("#beacon-id option:selected").val();
		for (var i in beacons) {
			if (beacons[i].uuid == uuid)
				$("#safety").val(beacons[i].safety);
		}
	};
	
	$(document).ready(function() {
		
		// Beacon ID
		$("#beacon-id").on("change", onSelectBeacon);
		
		// Form submit button
		var $formSubmit = $("#update-beacon input[type=\"submit\"]");
		$formSubmit.on("click", function(event) {
			event.preventDefault();
			onSubmit();
		}).attr("disabled", "disabled");
		
		// Get beacon list
		var request = $.ajax("beaconList", {
			dataType: "json",
			method: "GET"
		});
		
		request.done(function(data, status, hdr) {
			if (data.beacons && data.beacons.length > 0) {
				beacons = data.beacons;
				var $beaconId = $("#beacon-id");
				if ($beaconId.length == 1) 
				{
					for (var i in beacons) {
						var uuid = beacons[i].uuid;
						var $option = $("<option/>")
							.val(uuid)
							.text(uuid)
							.appendTo($beaconId);
					}
					$beaconId.val(beacons[0].uuid);
					onSelectBeacon();
					$formSubmit.removeAttr("disabled");
				}
				else
					console.log("Could not find beacon ID control");
			}
			else {
				console.log("Empty beacon list from database");
			}
		});
		
		request.fail(function(hdr, status, error) {
			console.log("Request FAIL");
			console.log(error);
		});
	});

})();