#!/bin/sh

GITHUB_REPO="mrtian2016/hass-panel"
# 检查version.json文件是否存在，如果不存在则创建
if [ ! -f /app/version.json ]; then
    echo '{"version": "0.0.0", "updateTime": ""}' > /app/version.json
fi

# 读取当前版本信息
CURRENT_VERSION=$(cat /app/version.json | jq -r .version)
echo "Current version: $CURRENT_VERSION"

LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases/latest")
LATEST_VERSION=$(echo $LATEST_RELEASE | jq -r .tag_name)
echo "Latest version: $LATEST_VERSION"

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "Updating to version $LATEST_VERSION"
    DOWNLOAD_URL=$(echo $LATEST_RELEASE | jq -r .assets[0].browser_download_url)
    rm -rf /app/*
    curl -L $DOWNLOAD_URL -o /tmp/release.zip
    unzip /tmp/release.zip -d /app/
    rm /tmp/release.zip
    
    # 更新version.json文件，包含版本号和更新时间
    CURRENT_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    echo "{\"version\": \"$LATEST_VERSION\", \"updateTime\": \"$CURRENT_TIME\"}" > /app/version.json
fi
