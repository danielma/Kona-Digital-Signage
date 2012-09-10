//
//  DSPreferencesController.h
//  DigitalSignage
//
//  Created by drailskid on 12/20/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface DSPreferencesController : NSWindowController {
    IBOutlet NSWindow *prefWindow;
}

@property (strong) NSWindow *prefWindow;

- (IBAction)closeWindow:(id)sender;
- (void)show;

@end
