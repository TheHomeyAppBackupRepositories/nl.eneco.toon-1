### Toon by Eneco app for Homey

Let Homey control your Toon!

Set the target temperature, read the room temperature and display your electricity usage in Insights!

NOTE: Currently the Toon API poses some limitations, gas measurement events are not pushed to Homey and only one Toon can be installed on a Homey at a time. We are waiting for these features to be implemented by Toon API.

DISCLAIMER: This application uses the Toon API but has not been developed, certified or otherwise approved on behalf of or on the instructions of Toon.

### Changelog
- 2.1.21: Fix an login error. Logging in to Toon should be available again.
- 2.1.20: Adds support for Energy
- 2.1.19: Improve error message when login failed
- 2.1.18: Moved to webhook events implementation
- 2.1.15: Fixes subscription logic
- 2.1.14: Fix crash when enabling/disabling program
- 2.1.12: Update OAuth2 implementation (adds login page in app settings)
- 2.0.6: Update environment variables
- 2.0.5: Fix power meter readings
- 2.0.0: Update to Toon API v3 which includes realtime webhook support (requires a re-pair due to API v1 and v3 incompatibilities)
- 1.3.6: Increase refresh tokens interval
- 1.3.5: Fix token example types
- 1.3.4: Add workaround for failing tokens refresh (might need to re-add Toon once).
- 1.3.3: Fix Flow tokens for gas and electricity Flow cards.
- 1.3.2: Add gas and electricity readings as displayed on Toon itself (current power usage, cumulative power usage per day, cumulative gas usage per day). Note: for these readings to show up in the mobile app Toon needs to be re-paired to Homey.
- 1.2.3: Immediately update target temperature when temperature state changed via Homey.
- 1.2.2: Update for SDKv2, and fix connection issues.
- 1.1.0: Added disable/enable program Flow cards, added resume/don't resume program option on state change Flow card, changing a state from Mobile will now not override the program.
- 1.0.14: Removed usage of "state": 1 parameter value in /temperature/states API call, this parameter should enforce the program to resume after the state change has expired, however it appears to cause instability which prevents users from changing the state at all.