/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb/common/html',
    'kb/common/utils',
    'kb/service/client/workspace',
    'kb_spec_common',
    'google-code-prettify',
    'datatables_bootstrap'],
    function ($, Promise, html, Utils, Workspace, specCommon, PR) {
        'use strict';

        // Just take params for now
        /* TODO: use specific arguments */
        var factory = function (config) {
            var mount, container, runtime = config.runtime;
            var dataType, moduleName, typeName, typeVersion;

            // tags used in this module.
            var t = html.tag,
                table = t('table'),
                tr = t('tr'),
                th = t('th'),
                td = t('td'),
                a = t('a'),
                div = t('div'),
                pre = t('pre'),
                ul = t('ul'),
                li = t('li'),
                span = t('span'),
                bstable = function (cols, rows) {
                    return html.makeTable({columns: cols, rows: rows, class: 'table'});
                };

            function tabTableContent() {
                return table({
                    class: 'table table-striped table-bordered',
                    style: {width: '100%'},
                    'data-attach': 'table'});
            }
            
            function renderTitle(typeName) {
                var title = [
                    'Type Specification for',
                    span({style: {textDecoration: 'underline'}}, typeName)
                ].join(' ');
                runtime.send('ui', 'setTitle', title);
            }

            // OVERVIEW Tab
            function overviewTab(data) {
                var typeNameDisplay = typeName;
                if(typeName.split('-').length!==2) {
                    // show latest version name
                    typeNameDisplay = data.released_type_vers[data.released_type_vers.length-1];
                }
                renderTitle(typeNameDisplay);
                return table({class: 'table table-striped table-bordered',
                    style: 'margin-left: auto; margin-right: auto'}, [
                    tr([th('Name'), td(typeNameDisplay)]),
                    //tr([th('Version'), td(typeVersion)]),
                    tr([th('In module version(s)'), td(
                            bstable(['Version id', 'Created on'], data.module_vers.map(function (moduleVer) {
                                var moduleId = moduleName + '-' + moduleVer;
                                return [a({href: '#spec/module/' + moduleId}, moduleVer),
                                    Utils.niceTimestamp(parseInt(moduleVer, 10))];
                            })))]),
                    tr([th('Description'), td(pre({style: {'white-space': 'pre-wrap', 'word-wrap': 'break-word'}}, data.description))])
                ]);
                /* TODO: Add back in the kidl editor -- need to talk to Roman */
            }

            // SPEC FILE Tab
            function specFileTab(data) {
                var specText = specCommon.replaceMarkedTypeLinksInSpec(moduleName, data.spec_def, 'links-click');
                var content = div({style: {width: '100%'}}, [
                    pre({class: 'prettyprint lang-spec'}, specText.replace('<', '&lt;').replace('>', '&gt;'))
                ]);
                return {
                    content: content,
                    widget: {
                        attach: function (node) {
                            PR.prettyPrint(null, node);
                        }
                    }
                };
            }

            // FUNCTIONS Tab
            function functionsTab(data) {
                // Build The table more functionally, using datatables.
                var tableData = data.using_func_defs.map(function (funcId) {
                    var parsed = funcId.match(/^(.+?)-(.+?)$/),
                        funcName = parsed[1],
                        funcVer = parsed[2];

                    return {
                        name: a({href: '#spec/functions/' + funcId}, funcName),
                        ver: funcVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Function name', mData: 'name'},
                        {sTitle: 'Function version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search function:',
                        sEmptyTable: 'No functions use this type'
                    }
                };

                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            var n = node.querySelector('[data-attach="table"]');
                            if (n !== null) {
                                $(n).dataTable(tableSettings);
                            }
                        }
                    }
                };
            }

            // USING TYPES Tab
            function usingTypesTab(data) {
                var tableData = data.using_type_defs.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/' + typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search types:',
                        sEmptyTable: 'No types use this type'
                    }
                };

                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            var n = node.querySelector('[data-attach="table"]');
                            if (n !== null) {
                                $(n).dataTable(tableSettings);
                            }
                        }
                    }
                };
            }

            // SUB TYPES Tab
            function subTypesTab(data) {
                var tableData = data.used_type_defs.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/' + typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search types:',
                        sEmptyTable: 'No types use this type'
                    }
                };
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            var n = node.querySelector('[data-attach="table"]');
                            if (n !== null) {
                                $(n).dataTable(tableSettings);
                            }
                        }
                    }
                };
            }

            // VERSIONS Tab
            function versionsTab(data) {
                var tableData = data.type_vers.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/' + typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search versions:',
                        sEmptyTable: 'No versions registered'
                    }
                };
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            var n = node.querySelector('[data-attach="table"]');
                            if (n !== null) {
                                $(n).dataTable(tableSettings);
                            }
                        }
                    }
                };
            }

            function render() {
                var workspace = new Workspace(runtime.getConfig('services.workspace.url', {
                    token: runtime.getService('session').getAuthToken()
                }));

                return workspace.get_type_info(dataType)
                    .then(function (data) {
                        var tabs = [
                            {title: 'Overview', id: 'overview', content: overviewTab},
                            {title: 'Spec-file', id: 'spec', content: specFileTab},
                            /* Functions no longer means anything... */
                            /*{title: 'Functions', id: 'funcs', content: functionsTab},*/
                            {title: 'Using Types', id: 'types', content: usingTypesTab},
                            {title: 'Sub-types', id: 'subs', content: subTypesTab},
                            {title: 'Versions', id: 'vers', content: versionsTab}
                        ],
                            id = '_' + html.genId(),
                            widgets = [];

                        var content = div([
                            ul({id: id, class: 'nav nav-tabs'},
                                tabs.map(function (tab) {
                                    var active = (tab.id === 'overview') ? 'active' : '';
                                    return li({class: active}, a({href: '#' + tab.id + id, 'data-toggle': 'tab'}, tab.title));
                                })),
                            div({class: 'tab-content'}, tabs.map(function (tab) {
                                var active = (tab.id === 'overview') ? ' active' : '',
                                    result = tab.content(data);
                                if (typeof result === 'string') {
                                    return div({class: 'tab-pane in' + active, id: tab.id + id}, tab.content(data));
                                }
                                // This is the emerging widget pattern: Save a list of widgets 
                                // and invoke them after the content is added to the dom,
                                // because they need a real node to render upon.
                                var widgetId = html.genId();
                                widgets.push({
                                    id: widgetId,
                                    widget: result.widget
                                });
                                return div({class: 'tab-pane in' + active, id: tab.id + id}, [
                                    div({id: widgetId}, [
                                        result.content
                                    ])
                                ]);
                            })
                                )
                        ]);
                        container.innerHTML = content;
                        return Promise.all(widgets.map(function (widget) {
                            var n = document.getElementById(widget.id);
                            return widget.widget.attach(n);
                        }));

                    })
                    .then(function () {
                        PR.prettyPrint();
                    });
            }

            // API

            var mount, container;

            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                });
            }

            function detach() {
                return Promise.try(function () {
                    if (mount && container) {
                        mount.removeChild(container);
                        container.innerHTML = '';
                    }
                });
            }

            function start(params) {
                return Promise.try(function () {
                    container.innerHTML = html.loading();

                    // Parse the data type, throwing exceptions if malformed.
                    dataType = params.datatype;
                    var matched = dataType.match(/^(.+?)\.(.+?)-(.+)$/);
                    if(matched && matched.length === 4) {
                        moduleName = matched[1];
                        typeName = matched[1] + '.' + matched[2];
                        typeVersion = matched[3];
                    }

                    matched = dataType.match(/^(.+?)\.(.+?)$/);
                    if(matched && matched.length === 3) {
                        moduleName = matched[1];
                        typeName = matched[1] + '.' + matched[2];
                        typeVersion = null;
                    }

                    if (!matched) {
                        throw new Error('Invalid data type ' + dataType);
                    }

                    /* TODO: reign this puppy in... */
                    // This is a promise that isn't returned ... so it just goes off by itself.
                    return render();
                });
            }

            return {
                attach: attach,
                detach: detach,
                start: start
            };
        };

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });