//
//  WebController.h
//  DigitalSignage
//
//  Created by drailskid on 12/15/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface WebController : NSObject
{
    IBOutlet NSWindow* window;
    WebView* webView;
}

- (void)setup;

- (void)createWebView;
- (void)setNotifications;
- (void)loadIndexPage;
- (void)reloadWebView;
- (void)alert:(NSString*)alertText;
- (void)screenChanged;
- (IBAction)toggleFullScreen:(id)sender;
- (IBAction)menuRefresh:(id)sender;
- (void)enterFullScreen;

@end
