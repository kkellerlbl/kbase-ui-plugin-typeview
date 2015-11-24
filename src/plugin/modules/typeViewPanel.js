/*global
 define, console
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb/common/html',
    'kb/common/widgetSet'
],
    function (Promise, html, widgetSetFactory) {
        'use strict';

        function widget(config) {
            var mount, container,
                runtime = config.runtime,
                widgetSet = widgetSetFactory.make({
                    runtime: runtime
                }),
                content;

            function renderTypePanel() {
                var div = html.tag('div');
                return div({class: 'kbase-view kbase-spec-view container-fluid', dataKbaseView: 'spec'}, [
                    div({class: 'row'}, [
                        div({class: 'col-sm-12'}, [
                            //div({id: addJQWidget('cardlayoutmanager', 'KBaseCardLayoutManager')}),
                            div({id: widgetSet.addWidget('kb_typeview_dataTypeSpec')})
                        ])
                    ])
                ]);
            }


            // API
            function init(config) {
                return Promise.try(function () {
                    content = renderTypePanel();
                    return widgetSet.init(config);
                });
            }
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = content;
                    return widgetSet.attach(container);
                });
            }
            function start(params) {
                return Promise.try(function () {
                    runtime.send('ui', 'setTitle', 'Type View Specifcation');
                    return widgetSet.start(params);
                });
            }
            function run(params) {
                return Promise.try(function () {
                    return widgetSet.run(params);
                });
            }
            function stop() {
                return Promise.try(function () {
                    return widgetSet.stop();
                });
            }
            function detach() {
                return Promise.try(function () {
                    return widgetSet.detach();
                });
            }
            function destroy() {
                return Promise.try(function () {
                    return widgetSet.destroy();
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                run: run,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }

        return {
            make: function (config) {
                return widget(config);
            }
        };
    });