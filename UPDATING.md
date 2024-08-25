# Updating Dependencies

The JavaScript and React Native communities create a lot of change across the landscape.
This project takes the philosophy of Alway Be Upgrading.  Consequently there is a fair
amount of overhead in keeping up with all these changes, but the benefit is that we
should avoid bit rot and having to do large breaking changes in an environment that
no long has current community support.

This process should be done monthly.

## Backup and Create New Branch

Ensure that any backup of your local system is up to date.

Create a new branch off of `main`: E.g., `git checkout -b njw-aug-2024-upgrade-cycle`

## Ensure You Can Do a Clean Build

  % rm -rf node_modules
  % npm install

Note that for some changes it may be required to quit Metro and restart it with:

npx react-native start --reset-cache

### On MacOS
  % cd ios
  % rm -rf Pods
  % pod install
  % cd ..
In Xcode, select 'Product -> Clean Build Folder...'.
Build for Simulator and make sure it works.
Build for you own iPhone (if you have one).

### For Android
In Android Studio, select 'Build - Clean Project'.
Build for the emmulator and make sure it works.
Build for your own Android (if you have one).

Commit any changes to your branch.

## Upgrade Node

Get your current version: `node --version`
See what the latest LTS version is: `nvm ls-remote | grep 'Latest LTS' | tail -1`
If your version is equal to or later than the latest LTS, you're done with this section.

If you are not up to the latest LTS, install it: `nvm install <version>`
Use the latest version in your current shell: `nvm use <version>`
Make it the default: `nvm alias default <version>` (new shells should now use this version)

Run through the "Ensure You Can Do a Clean Build" process above.

## Upgrade React Native

### Get your current version of React Native
  grep '"react-native"' package.json | sed 's/^.*: "//' | sed 's/".*$//'
  E.g., 0.73.5

Use the React Native Upgrade Helper: https://react-native-community.github.io/upgrade-helper/
This will tell you what the latest current version is.  E.g., 0.75.2

I recommend taking it slowly.  In this case, I first upgraded the patch version of react native.
So in this case I targeted 0.73.9.  Then take each minor version in turn.  So in this case
I targeted 0.74.5.  Then finally just to the latest version, 0.75.2.

Shutdown Xcode and Android Studio before making the changes recommend by the Upgrade Helper.

The upgrade helper recommends using align-deps, but review what it recommends.  I don't
recommend downgrading any packages based on that output.

Note that the diffs from the Upgrade Helper assume your application is RnDiffApp, so you
need to replace that string with MushroomObserver where appropriate in filenames and
the application of diffs.

After you apply all the recommend diffs, run through the "Ensure You
Can Do a Clean Build" process above.

If you have build issues, you may need to update some specific JS package.  E.g.,

  % npm uninstall react-native-reanimated
  % npm install react-native-reanimated

Be sure you add any new files to git.

## Update all NPM packages

This may be something you need to do as part of the React Native upgrade, but if not
the final phase is to run:

  % npm update

On MacOS, you should also do:

  % cd ios
  % pod update

After doing this you want to again run through the "Ensure You Can Do a Clean Build" process.
