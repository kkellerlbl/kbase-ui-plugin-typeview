/*global
 define, console
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb_common_html',
    'kb_common_widgetSet'
],
    function (Promise, html, widgetSet) {
        'use strict';

//        function renderTypePanel(params) {
//            return new Promise(function (resolve) {
//
//                // Widgets
//                // Widgets are an array of functions or promises which are 
//                // invoked later...
//                var widgetSet = wigetSet.make({
//                    runtime: runtime
//                })
//
//                // Render panel
//                var div = html.tag('div');
//                var panel = div({class: 'kbase-view kbase-spec-view container-fluid', 'data-kbase-view': 'spec'}, [
//                    div({class: 'row'}, [
//                        div({class: 'col-sm-12'}, [
//                            //div({id: addJQWidget('cardlayoutmanager', 'KBaseCardLayoutManager')}),
//                            div({id: widgets.addFactoryWidget('datatypespec', DataTypeSpecWidget)})
//                        ])
//                    ])
//                ]);
//                resolve({
//                    title: 'Data Type Specification',
//                    content: panel,
//                    widgets: widgets.getWidgets()
//                });
//            });
//        }

        function widget(config) {
            var mount, container, children = [], 
                runtime = config.runtime,  
                widgetSet = widgetSet.make({
                    runtime: runtime
                });
            
             function renderTypePanel() {
                var div = html.tag('div');
                return div({class: 'kbase-view kbase-spec-view container-fluid', dataKbaseView: 'spec'}, [
                    div({class: 'row'}, [
                        div({class: 'col-sm-12'}, [
                            //div({id: addJQWidget('cardlayoutmanager', 'KBaseCardLayoutManager')}),
                            div({id: widgetSet.addWiget('kb_typeview_dataTypeSpec')})
                        ])
                    ])
                ]);
            }
            
            
            // API

            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = renderTypePanel();
                    return widgetSet.attach(container);
                });
            }
            function start(params) {
                return Promise.try(function () {
                    runtime.send('ui', 'setTitle', rendered.title);
                    return widgetSet.start(params);
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

            return {
                attach: attach,
                start: start,
                stop: stop,
                detach: detach
            };
        }

        return {
            make: function (config) {
                return widget(config);
            }
        };
    });