# Hass-Panel

English | [简体中文](README.md)

> The Simplest Home Assistant Control Panel Ever | React-based | One-click HAOS Deployment | No Programming Experience Required | Ready to Use Out of the Box



🌐 [Official Website](https://hass-panel.com) | 📖 [Documentation](https://hass-panel.com/guide/install.html)

## Video Preview
[![A React-based Smart Home Control Panel]( https://i.imgur.com/PpbbnAS.png )](https://www.bilibili.com/video/BV1yxfaYHE5A/?share_source=copy_web&vd_source=3ef738469d1538347bdba19ea015dbd7)

## Preview Image
![Preview](https://i.imgur.com/ONjR4Fp.jpeg)

## Discussion Group

<img src="https://i.imgur.com/ct6Tu5R.jpeg" width="300" alt="Discussion Group" />

## Key Features

- 📱 Responsive design, supports both mobile and desktop
- 🔧 Highly configurable with drag-and-drop layout
- 🚀 PWA support, can be installed on desktop
- 🎨 Beautiful user interface:
  - Light/Dark/System-follow theme modes
  - Frosted glass effect card design
  - Theme-colored scrollbar
  - Optimized mobile view
- 👥 Multi-user management system with JWT authentication
- 🔐 Secure password encryption storage
- 🎥 Powerful camera support:
  - WebRTC/ONVIF/RTSP protocol support
  - HLS stream auto-detection and switching
  - Optimized video stream playback
- 🔌 Rich device support:
  - Light control
  - AC control
  - Curtain control
  - Sensor monitoring
  - Camera viewing
  - Scene control
  - Power consumption statistics
  - Socket control
  - Server monitoring
  - PVE virtual machine monitoring
  - Universal entity card (supports custom configuration and grouping)
  - More devices coming soon...

## Installation

### Important Note
Starting from version v1.3.2:
- The system uses SQLite database for configuration storage
- Initial system setup is required for first-time use
- Camera functionality requires proper ONVIF/RTSP address configuration

For detailed installation and configuration instructions, please visit the [official documentation](https://hass-panel.com/guide/install.html).

### Docker Method (Stable)
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  --network host \
  -v ./data/:/config/hass-panel \
  -d \
  ghcr.io/mrtian2016/hass-panel:latest
```

### Home Assistant Addon Method

[![Add to Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fmrtian2016%2Fhass-panel)

Or manually add:

1. In Home Assistant's sidebar, click "Configuration" -> "Add-ons" -> "Add-on Store"
2. Click the three dots in the top right corner, select "Repositories"
3. Add repository URL: `https://github.com/mrtian2016/hass-panel`
4. Click "Add" and refresh the page
5. Find and install "Hass Panel" in the add-on store
6. After starting, it can be accessed from the sidebar

## Feature Configuration

For detailed feature configuration and usage instructions, please visit the [documentation](https://hass-panel.com/guide/install.html).

### Supported Card Types

1. Time Card (TimeCard)
2. Weather Card (WeatherCard) - Supports AQI internationalization and wind direction
3. Light Status Card (LightStatusCard)
4. Light Overview Card (LightOverviewCard)
5. Sensor Card (SensorCard)
6. Media Player Card (MediaPlayerCard)
7. Max Player Card (MaxPlayerCard)
8. Curtain Card (CurtainCard)
9. Electricity Card (ElectricityCard) - Optimized voltage, current and power display
10. Router Card (RouterCard) - Supports runtime display
11. NAS Card (NASCard) - Improved storage information display
12. Camera Card (CameraCard) - Supports multiple video stream protocols
13. Climate Card (ClimateCard)
14. Motion Card (MotionCard)
15. Water Purifier Card (WaterPurifierCard)
16. Illuminance Card (IlluminanceCard)
17. Script Panel (ScriptPanel)
18. Socket Card (SocketCard)
19. Universal Entity Card (UniversalCard) - Supports custom entity configuration and grouping
20. PVE Card (PVECard) - Virtual machine monitoring
21. Server Card (ServerCard)

### Card Management

- Support show/hide control
- Support drag-and-drop sorting
- Support custom size (desktop)
- Support add/edit/delete cards (with confirmation protection)
- Support custom layout (3-10 columns)
- Support responsive layout
- Support entity smart search and auto-completion

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build production version
npm run build
```

## Latest Version (v1.3.5)

### 🌟 Major Updates
- Theme system fully upgraded with "Follow System" option
- New frosted glass effect card design
- Added universal card component with custom configuration
- Added PVE and server monitoring functionality
- Enhanced camera features with multiple stream support

### 🔧 Technical Optimizations
- SQLite database connection pool optimization
- Component upgrades and refactoring
- Performance improvements and bug fixes
- Enhanced multilingual support

For detailed changelog, please check [Releases](https://github.com/mrtian2016/hass-panel/releases)

## FAQ

1. Configuration not taking effect
   - Verify entity ID is correct
   - Try refreshing the page

2. Device shows offline
   - Check Home Assistant connection
   - Verify entity ID exists
   - Confirm device is online

3. Icons not showing
   - Check if icon name is correct
   - Confirm using supported icons

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mrtian2016/hass-panel&type=Date)](https://star-history.com/#mrtian2016/hass-panel&Date)

## Contributing

Pull Requests and Issues are welcome!

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). This means:

- You can freely use, modify, and distribute this software
- If you modify and distribute this software, you must:
  - Make your modified source code available to all users
  - License your modifications under AGPL-3.0
  - State your changes
- Any network use (like web applications) counts as distribution
- All derivative works must also be licensed under AGPL-3.0

For more details, see the [full license text](https://www.gnu.org/licenses/agpl-3.0.en.html).

## Sponsorship

If you find this project helpful, feel free to sponsor!

| WeChat Donation Code | Alipay Donation Code |
|--------|--------|
| ![WeChat Donation Code](https://i.imgur.com/f3Fxtsc.png) | ![Alipay Donation Code](https://i.imgur.com/bdNzzyW.png) |