#!/usr/bin/env node

module.exports = function (context) {
    var IosSDKVersion = "OpenTok-iOS-2.10.1";
    var Q = context.requireCordovaModule('q'),
        deferral = new Q.defer();

    const exec = require('child_process').exec;

    var script = `
        bash -x -e -c '
            echo $CACHE_PATH

            CACHE_PATH=\${CACHE_PATH:-.cache}
            IOS_SDK_VERSION=${IosSDKVersion}
            IOS_SDK_FILENAME=\$IOS_SDK_VERSION.tar.bz2
            IOS_SDK_URL="https://s3.amazonaws.com/artifact.tokbox.com/rel/ios-sdk/$IOS_SDK_FILENAME"
            IOS_SDK_FRAMEWORK=$IOS_SDK_VERSION/OpenTok.framework
            PLUGIN_FRAMEWORK_PATH="${context.opts.plugin.dir + '/src/ios/'}"

            mkdir -p $CACHE_PATH
            pushd $CACHE_PATH
            if [ ! -d "$IOS_SDK_FRAMEWORK" ]; then
                curl -L -O "$IOS_SDK_URL"
                tar zxf "$IOS_SDK_FILENAME"
            fi

            cp -r $IOS_SDK_FRAMEWORK $PLUGIN_FRAMEWORK_PATH

        '
    `;

    const cmd = exec(script);

    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
    cmd.on('exit', function () {
        deferral.resolve();
    })

    return deferral.promise;
};
