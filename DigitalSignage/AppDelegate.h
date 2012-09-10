//
//  AppDelegate.h
//  DigitalSignage
//
//  Created by drailskid on 12/15/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "WebController.h"
#import "DSPreferencesController.h"

@interface AppDelegate : NSObject <NSApplicationDelegate> {
    
    __unsafe_unretained WebController *webController;
    DSPreferencesController *dsPreferencesController;
}



@property (unsafe_unretained) IBOutlet WebController *webController;
@end