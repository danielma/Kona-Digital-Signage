//
//  DSPreferencesController.m
//  DigitalSignage
//
//  Created by drailskid on 12/20/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "DSPreferencesController.h"

@implementation DSPreferencesController
@synthesize prefWindow;


- (id)initWithWindow:(NSWindow *)window
{
    self = [super initWithWindow:window];
    if (self) {
    }
    
    return self;
}

- (void)awakeFromNib {
    [prefWindow makeKeyAndOrderFront:self];
}

- (void)windowDidLoad
{
    [super windowDidLoad];
    
    // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
}

- (IBAction)closeWindow:(id)sender {
    [prefWindow close];
}

- (void)show {
    [self showWindow:nil];
}

@end
