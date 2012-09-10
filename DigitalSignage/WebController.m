//
//  WebController.m
//  DigitalSignage
//
//  Created by drailskid on 12/15/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "WebController.h"

@implementation WebController


//this returns a nice name for the method in the JavaScript environment
+(NSString*)webScriptNameForSelector:(SEL)sel
{
    return nil;
}

//this allows JavaScript to call the -logJavaScriptString: method
+ (BOOL)isSelectorExcludedFromWebScript:(SEL)sel
{
//    if(sel == @selector(logJavaScriptString:))
        return NO;
//    return YES;
}

//called during applicationDidFinishLaunching in AppDelegate.h
- (void)setup
{
    NSLog(@"setting up WebController");
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    
    [self setNotifications];
    
    [self createWebView];
    
    NSTimer *timer = [[NSTimer alloc] initWithFireDate:[NSDate dateWithTimeIntervalSinceNow:3600] interval:3600 target:self selector:@selector(refreshPage:) userInfo:nil repeats:YES]; // 3600 = 1 hour
    
    [[NSRunLoop currentRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
    
    if ([prefs boolForKey:@"autoFullScreen"]) {
        [self toggleFullScreen:self];
    }
}

- (void)createWebView {
    NSRect windowFrame = NSMakeRect(0, 0, [[window contentView] frame].size.width, [[window contentView] frame].size.height);
    
    webView = [[WebView alloc] initWithFrame:windowFrame];
    [[window contentView] addSubview:webView];
    [webView setFrameLoadDelegate:self];
    [webView setAutoresizingMask: (NSViewWidthSizable | NSViewHeightSizable)];
    
    [self loadIndexPage];
}

- (void)setNotifications {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(viewChangeSize:) name:NSViewDidUpdateTrackingAreasNotification object:[window contentView]];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(screenChanged) name:NSApplicationDidChangeScreenParametersNotification object:[NSApplication sharedApplication]];
}


- (void)loadIndexPage {
    NSLog(@"let's load some index!");
    NSString *resourcesPath = [[NSBundle mainBundle] resourcePath];
	NSString *htmlPath = [resourcesPath stringByAppendingString:@"/html/index.html"];
	[[webView mainFrame] loadRequest:[NSURLRequest requestWithURL:[NSURL fileURLWithPath:htmlPath]]];
}

- (void)alert:(NSString *)alertText {
    NSAlert *alert = [[NSAlert alloc] init];
    [alert addButtonWithTitle:@"OK"];
    [alert setMessageText:alertText];
    [alert setAlertStyle:NSWarningAlertStyle];
    [alert beginSheetModalForWindow:window modalDelegate:self didEndSelector:nil contextInfo:nil];
    
}

- (void)reloadWebView {
    NSLog(@"Relaunching");
    [webView setHidden:YES];
    [webView removeFromSuperview];
    webView = NULL;
    
    [self createWebView];
    
//    [NSApp relaunch:nil];
}

- (IBAction)menuRefresh:(id)sender {
//    NSLog(@"webView = %@", [webView description]);
    [self loadIndexPage];
}

- (IBAction)toggleFullScreen:(id)sender {
    NSApplicationPresentationOptions presentationOptions = NSApplicationPresentationAutoHideMenuBar + NSApplicationPresentationHideDock;

    NSDictionary *fullScreenOptions = [NSDictionary dictionaryWithObjectsAndKeys:
                                       [NSNumber numberWithInt:0],
                                       NSFullScreenModeAllScreens,
                                       [NSNumber numberWithUnsignedInteger:presentationOptions],
                                       NSFullScreenModeApplicationPresentationOptions,                                       
                                       nil];
                                                                            
    if ([webView isInFullScreenMode]) {
        [window makeKeyAndOrderFront:self];
        [webView exitFullScreenModeWithOptions:fullScreenOptions];
        [NSCursor unhide];
    } else {
        [webView enterFullScreenMode:[NSScreen mainScreen] withOptions:fullScreenOptions];
        [window orderOut:self];
        [NSCursor hide];
    }
    
    [self loadIndexPage];
}

- (void)enterFullScreen {
    // If we're in full screen, go out and back in, otherwise, just go into
    
    if ([webView isInFullScreenMode]) {
        [self toggleFullScreen:self];
    }
    
    [self toggleFullScreen:self];
}

//this is called as soon as the script environment is ready in the webview
- (void)webView:(WebView *)sender didClearWindowObject:(WebScriptObject *)windowScriptObject forFrame:(WebFrame *)frame
{
    //add the controller to the script environment
    //the "Cocoa" object will now be available to JavaScript
    [windowScriptObject setValue:self forKey:@"Cocoa"];
}

- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {
    NSString *layoutSrc = [[NSUserDefaults standardUserDefaults] stringForKey:@"config"];
//    NSString *layoutSrc = @"js/layout.js";
    
    NSLog(@"layoutSrc = %@", layoutSrc);
    
    [[sender windowScriptObject] callWebScriptMethod:@"appendScript" withArguments:[NSArray arrayWithObject:layoutSrc]];
}

- (void)viewChangeSize:(NSWindow *)theWindow {
    NSLog(@"viewChangeSize:");
    [self loadIndexPage];
}

- (void)screenChanged {
    NSLog(@"Screen changed...");
    [self enterFullScreen];
}

@end
