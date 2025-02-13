# Hass-Panel

English | [简体中文](README.md)

A React-based smart home control panel that uses the Home Assistant Websocket API and supports deployment as a Home Assistant OS (HAOS) addon.

## Video Preview
[![A React-based Smart Home Control Panel]( https://i.imgur.com/PpbbnAS.png )](https://www.bilibili.com/video/BV1yxfaYHE5A/?share_source=copy_web&vd_source=3ef738469d1538347bdba19ea015dbd7)

## Preview Image
![Preview](https://i.imgur.com/ZV71KM8.jpeg)

## Discussion Group

<img src="https://i.imgur.com/M6wEC8M.jpeg" width="300" alt="Discussion Group" />

## Key Features

- 📱 Responsive design, supports both mobile and desktop
- 🔧 Highly configurable with drag-and-drop layout
- 🚀 PWA support, can be installed on desktop
- 🎨 Beautiful user interface with dark mode support
- 🔌 Rich device support:
  - Light control
  - AC control
  - Curtain control
  - Sensor monitoring
  - Camera viewing
  - Scene control
  - More devices coming soon...

## Installation

### Docker Method
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  -p 5123:5123 \
  -v ./data/:/config/hass-panel \
  -e REACT_APP_HASS_URL=your-hass-instance:8123 \
  -e REACT_APP_HASS_TOKEN=your-hass-token \ # Optional, if token authentication is needed
  -d \
  ghcr.io/mrtian2016/hass-panel:latest
```

Environment Variables:
- `REACT_APP_HASS_URL`: Home Assistant instance address
- `REACT_APP_HASS_TOKEN`: Home Assistant long-lived access token (optional)

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

### Supported Card Types

1. Time Card
2. Weather Card
3. Light Status Card
4. Light Overview Card
5. Sensor Card
6. Media Player Card
7. Curtain Card
8. Electricity Card
9. Router Card
10. NAS Card
11. Camera Card
12. Climate Card
13. Motion Card
14. Water Purifier Card
15. Illuminance Card
16. Script Panel

### Card Management

- Support show/hide control
- Support drag-and-drop sorting
- Support custom size (desktop)
- Support add/edit/delete cards
- Support custom layout (3-5 columns)
- Support responsive layout

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build production version
npm run build
```

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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mrtian2016/hass-panel&type=Date)](https://star-history.com/#mrtian2016/hass-panel&Date)

## Sponsorship

If you find this project helpful, feel free to sponsor!

<img src="https://i.imgur.com/qYhxNZx.jpeg" width="300" alt="Sponsor QR Code" /> 