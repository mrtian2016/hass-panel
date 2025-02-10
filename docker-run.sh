
docker rm -f test-hass 
docker run \
 --name=test-hass  \
  -p 51230:5123 \
  -p 51240:5124 \
  -v ./webdav:/config/hass-panel/webdav \
  -e REACT_APP_HASS_URL=http://10.0.0.70:8123 \
  -e WEBDAV_USERNAME=admin \
  -e WEBDAV_PASSWORD=admin \
  ghcr.io/mrtian2016/hass-panel:latest