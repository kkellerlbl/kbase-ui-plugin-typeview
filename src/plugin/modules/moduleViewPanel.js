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
    function (Promise, html, widgetSetFactory) {
        'use strict';
       

        function widget(config) {
            var mount, container, children = [], runtime = config.runtime,
                widgetSet = widgetSetFactory.make({
                    runtime: runtime
                }), content;
            
            
             function renderModulePanel(params) {
                var div = html.tag('div');
                return div({class: 'kbase-view kbase-spec-view container-fluid', 'data-kbase-view': 'spec'}, [
                    div({class: 'row'}, [
                        div({class: 'col-sm-12'}, [
                            //div({id: addJQWidget('cardlayoutmanager', 'KBaseCardLayoutManager')}),
                            //div({id: widgets.addFactoryWidget('datatypespec', ModuleSpecWidget, {
                            //    moduleid: params.moduleid
                            //    })})
                            div({id: widgetSet.addWidget('kb_typeview_moduleSpec')})
                        ])
                    ])
                ]);
            }
            
            
            function init(config) {
                Promise.try(function () {
                    content = renderModulePanel();
                    return widgetSet.init(config);
                });
            }
            function attach(node) {
               Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    // There, NOW the widget notes are instantiated.
                    container.innerHTML = content;
                    return widgetSet.attach(container);
                });
            }
            function start(params) {
                return Promise.try(function () {
                    runtime.send('ui', 'setTitle', 'Module View');
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
        ;

        return {
            make: function (config) {
                return widget(config);
            }
        };
    });