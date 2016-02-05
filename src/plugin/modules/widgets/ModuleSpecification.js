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
    'underscore',
    'kb/common/html',
    'kb/service/client/workspace',
    'kb_spec_common',
    'google-code-prettify',
    'kb/common/format',
    'datatables_bootstrap'],
    function ($, Promise, _, html, Workspace, specCommon, PR, Format) {
        'use strict';

        // Just take params for now
        /* TODO: use specific arguments */
        var factory = function (config) {

            var mount, container, runtime = config.runtime;

            var workspace = new Workspace(runtime.getConfig('workspace_url', {
                token: runtime.getService('session').getAuthToken()
            }));

            var moduleName, moduleVersion;

            // tags used in this module.
            var table = html.tag('table'),
                tr = html.tag('tr'),
                th = html.tag('th'),
                td = html.tag('td'),
                a = html.tag('a'),
                div = html.tag('div'),
                pre = html.tag('pre'),
                ul = html.tag('ul'),
                li = html.tag('li');

            function tabTableContent() {
                return table({
                    class: 'table table-striped table-bordered',
                    style: {width: '100%'},
                    'data-attach': 'table'});
            }

            // OVERVIEW Tab
            function overviewTab(data) {
                var username = runtime.getService('session').getUsername(),
                    isOwner = _.some(data.owners, function (item) {
                        return (item === username);
                    });

                return table({class: 'table table-striped table-bordered',
                    style: 'margin-left: auto; margin-right: auto'}, [
                    tr([th('Name'), td(moduleName)]),
                    tr([th('Owners'), td(data.owners.join(', '))]),
                    tr([th('Version'), td(data.ver)]),
                    /* TODO: improve date formatting */
                    tr([th('Created on'), td(Format.niceTime(data.ver))]),
                    tr([th('Description'), td(pre({style: {'white-space': 'pre-wrap', 'word-wrap': 'break-word'}}, data.description))])
                ]);
            }

            // SPEC FILE Tab
            function specFileTab(data) {
                var specText = specCommon.replaceMarkedTypeLinksInSpec(moduleName, data.spec, 'links-click');
                var content = div({style: {width: '100%'}}, [
                    pre({class: 'prettyprint lang-spec'}, specText)
                ]);
                return {
                    content: content,
                    widget: {
                        attach: function (node) {
                            PR.prettyPrint(null, node.get(0));
                        }
                    }
                };
            }

            // FUNCTIONS Tab
            function functionsTab(data) {
                // Build The table more functionally, using datatables.
                var tableData = data.functions.map(function (funcId) {
                    var parsed = funcId.match(/^(.+?)-(.+?)$/),
                        funcName = parsed[1],
                        funcVer = parsed[2];

                    return {
                        name: a({href: '#', 'data-action': 'spec-functions', 'data-funcid': funcId}, funcName),
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
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // TYPES Tab
            function typesTab(data) {

                var tableData = Object.keys(data.types).map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        name = parsed[1],
                        version = parsed[2];

                    return {
                        name: a({href: '#spec/type/' + typeId}, name),
                        ver: version
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
                        sEmptyTable: 'No types registered'
                    }
                };

                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // INCLUDED MODULES Tab
            function includedModulesTab(data) {

                var tableData = Object.keys(data.included_spec_version).map(function (name) {
                    var version = data.included_spec_version[name],
                        id = name + '-' + version;
                    return {
                        name: a({href: '#spec/module/' + id}, name),
                        ver: version
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Module name', mData: 'name'},
                        {sTitle: 'Module version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search module:',
                        sEmptyTable: 'No included modules used.'
                    }
                };
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // VERSIONS Tab

            // Look, a little mini widget.
            // Can we integrate this with the widgetManager, or perhaps we just 
            // don't need to fuss.
            function versionsTab(data) {
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            return workspace.list_module_versions({mod: moduleName})
                                .then(function (data) {
                                    var tableData = data.vers.map(function (version) {
                                        if (version === moduleVersion) {
                                            return {
                                                name: '' + version + ' (current)',
                                                date: version
                                            };
                                        } else {
                                            return {
                                                name: a({href: '#spec/module/' + moduleName + '-' + version}, version),
                                                date: version
                                            };
                                        }
                                    });
                                    var tableSettings = {
                                        sPaginationType: 'full_numbers',
                                        iDisplayLength: 10,
                                        aoColumns: [
                                            {sTitle: 'Module version', mData: 'name'},
                                            {sTitle: 'Upload date', mData: function (row, type) {
                                                    switch (type) {
                                                        case 'display':
                                                            return Format.niceTime(row.date);
                                                            break;
                                                        default:
                                                            return row.date;
                                                    }
                                                }}
                                        ],
                                        aaData: tableData,
                                        oLanguage: {
                                            sSearch: 'Search versions:',
                                            sEmptyTable: 'No versions registered.'
                                        }
                                    };

                                    $(node).find('[data-attach="table"]').dataTable(tableSettings);
                                });
                        }
                    }
                };
            }

            function render() {
                return workspace.get_module_info({mod: moduleName, ver: moduleVersion})
                    .then(function (data) {
                        var tabs = [
                            {title: 'Overview', id: 'overview', content: overviewTab},
                            {title: 'Spec-file', id: 'spec', content: specFileTab},
                            {title: 'Types', id: 'types', content: typesTab},
                            /* functions no longer mean anything */
                            /*{title: 'Functions', id: 'funcs', content: functionsTab}, */
                            {title: 'Included modules', id: 'inc', content: includedModulesTab},
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
                            }))
                        ]);
                        container.innerHTML = content;
                        return Promise.all(widgets.map(function (widget) {
                            return Promise.try(function () {
                                return widget.widget.attach($('#' + widget.id));
                            });
                        }));
                    })
                    .then(function () {
                        PR.prettyPrint();
                    });
            }

            // API

            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                });
            }
            function detach() {
                return Promise.try(function () {
                    if (container) {
                        mount.removeChild(container);
                        container.innerHTML = '';
                    }
                });
            }

            function start(params) {
                return Promise.try(function () {
                    container.innerHTML = html.loading();

                    // Parse the data type, throwing exceptions if malformed.
                    var moduleId = params.moduleid;
                    var matched = moduleId.match(/^(.+?)-(.+)$/);
                    if(matched && matched.length===3) {
                        moduleName = matched[1];
                        moduleVersion = matched[2];
                    } else {
                        matched = moduleId.match(/^(.+?)$/);
                        if(matched && matched.length===2) {
                            moduleName = matched[1];
                            moduleVersion = null;
                        }
                    }

                    if (!matched) {
                        throw new Error('Invalid module id ' + moduleId);
                    }

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