//
//  AppDelegate.m
//  DigitalSignage
//
//  Created by drailskid on 12/15/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "AppDelegate.h"

@implementation AppDelegate

@synthesize webController;


- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    NSLog(@"setting defaults");
    [[NSUserDefaults standardUserDefaults] registerDefaults:[NSDictionary dictionaryWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"Defaults" ofType:@"plist"]]];
    
    [webController setup];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

- (IBAction)openPreferencesWindow:(id)sender {
    dsPreferencesController = [[DSPreferencesController alloc] initWithWindowNibName:@"DSPreferences"];
    [dsPreferencesController show];
}

- (void)applicationWillTerminate:(NSNotification *)notification {
    
}

@end
