
docker rm -f test-hass 
docker run \
 --name=test-hass  \
  -p 5123:5123 \
  -p 5124:5124 \
  -e REACT_APP_HASS_URL=http://10.0.0.70:8123 \
  -e WEBDAV_USERNAME=admin \
  -e WEBDAV_PASSWORD=admin \
  ghcr.io/mrtian2016/hass-panel:latest