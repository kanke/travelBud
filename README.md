# travelBud

Change NavigationDrawerFragment.getMenu() method in order to add, remove or change the contents of the menu:

public List getMenu() {
        List items = new ArrayList();
        items.add(new NavigationItem(getString(R.string.search), getResources().getDrawable(R.drawable.ic_action_search)));
        items.add(new NavigationItem(getString(R.string.stats), getResources().getDrawable(R.drawable.ic_action_trending_up)));
        items.add(new NavigationItem(getString(R.string.myaccount), getResources().getDrawable(R.drawable.ic_action_account_box)));
        items.add(new NavigationItem(getString(R.string.settings), getResources().getDrawable(R.drawable.ic_action_settings)));
        return items;
    }
    
    
    Change onNavigationDrawerItemSelected to change your menu behavior:
    
    @Override
    public void onNavigationDrawerItemSelected(int position) {
        Fragment fragment;
        switch (position) {
            case 0: //search//todo
                break;
            case 1: //stats
                fragment = getFragmentManager().findFragmentByTag(StatsFragment.TAG);
                if (fragment == null) {
                    fragment = new StatsFragment();
                }
                getFragmentManager().beginTransaction().replace(R.id.container, fragment, StatsFragment.TAG).commit();
                break;
            case 2: //my account //todo
                break;
            case 3: //settings //todo
                break;
        }
    }
    
    
    Add items to main.xml to create a custom menu:
    
    <menu xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:app="http://schemas.android.com/apk/res-auto">
    <item
        android:id="@+id/action_search"
        android:title="@string/action_search"
        app:showAsAction="always"
        android:icon="@drawable/ic_action_search_white"/>
    <item
        android:id="@+id/action_filter"
        android:title="@string/action_filter"
        app:showAsAction="ifRoom"
        android:icon="@drawable/ic_action_filter_white"/>
</menu>

