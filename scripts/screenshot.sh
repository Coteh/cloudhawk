#!/bin/sh

OUTPUT_FILE=screenshots/screenshot.gif

WIDTH=1500
HEIGHT=1050
X=930
Y=158

# Install Cypress first before running this script

./node_modules/.bin/cypress run --spec cypress/e2e/screenshot.cy.ts

# Crop filter adapted from: https://video.stackexchange.com/a/4571
# GIF filters adapted from: https://superuser.com/a/556031

ffmpeg -y -ss 1 -i cypress/videos/screenshot.cy.ts.mp4 -filter:v "crop=$WIDTH:$HEIGHT:$X:$Y,fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 $OUTPUT_FILE
