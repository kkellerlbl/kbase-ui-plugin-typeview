define([
    'jquery',
    'bluebird',
    'kb_common/html',
    'kb_service/client/workspace',
    '../kbaseSpecCommon',
    'google-code-prettify',
    'kb_common/format',
    'datatables_bootstrap'
], function(
    $,
    Promise,
    html,
    Workspace,
    specCommon,
    PR
) {
    'use strict';

    // Just take params for now
    /* TODO: use specific arguments */
    var factory = function(config) {

        var mount, container, runtime = config.runtime;

        var workspace = new Workspace(runtime.getConfig('services.workspace.url', {
            token: runtime.getService('session').getAuthToken()
        }));

        var functionId, moduleName, functionName, functionVersion;

        // tags used in this module.
        var t = html.tag,
            span = t('span'),
            table = t('table'),
            tr = t('tr'),
            th = t('th'),
            td = t('td'),
            a = t('a'),
            div = t('div'),
            pre = t('pre'),
            ul = t('ul'),
            li = t('li');

        function tabTableContent() {
            return table({
                class: 'table table-striped table-bordered',
                style: { width: '100%' },
                'data-attach': 'table'
            });
        }

        function renderTitle(name) {
            var title = [
                'Function Specification for',
                span({ style: { textDecoration: 'underline' } }, name)
            ].join(' ');
            runtime.send('ui', 'setTitle', title);
        }

        // OVERVIEW Tab
        function overviewTab(data) {
            var matched = data.func_def.match(/-/),
                funcName = matched[1],
                funcVersion = matched[2],
                moduleLinks = data.module_vers.map(function(moduleVersion) {
                    var moduleId = moduleName + '.' + moduleVersion;
                    return a({ href: '#spec/module/' + moduleId }, moduleVersion);
                });

            renderTitle(funcName);

            return table({
                class: 'table table-striped table-bordered',
                style: 'margin-left: auto; margin-right: auto'
            }, [
                tr([th('Name'), td(funcName)]),
                tr([th('Version'), td(funcVersion)]),
                tr([th('Module version(s)'), td(moduleLinks.join(', '))]),
                /* TODO: improve date formatting */
                tr([th('Description'), td(pre({ style: { 'white-space': 'pre-wrap', 'word-wrap': 'break-word' } }, data.description))])
            ]);
        }

        // SPEC FILE Tab
        function specFileTab(data) {
            var specText = specCommon.replaceMarkedTypeLinksInSpec(moduleName, data.spec_def, 'links-click'),
                content = div({
                    style: {
                        width: '100%'
                    }
                }, [
                    pre({
                        class: 'prettyprint lang-spec'
                    }, specText.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                ]);
            return {
                content: content,
                widget: {
                    attach: function(node) {
                        PR.prettyPrint(null, node);
                    }
                }
            };
        }

        // SUB TYPES Tab
        function subTypesTab(data) {
            var tableData = data.used_type_defs.map(function(typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({ href: '#spec/type/' + typeId }, typeName),
                        ver: typeVer
                    };
                }),
                tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        { sTitle: 'Type name', mData: 'name' },
                        { sTitle: 'Type version', mData: 'ver' }
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
                    attach: function(node) {
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
            var tableData = data.func_vers.map(function(funcId) {
                    var parsed = funcId.match(/^(.+?)-(.+?)$/),
                        funcName = parsed[1],
                        funcVer = parsed[2];

                    return {
                        name: a({ href: '#spec/function/' + funcId }, funcName),
                        ver: funcVer
                    };
                }),
                tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        { sTitle: 'Function name', mData: 'name' },
                        { sTitle: 'Function version', mData: 'ver' }
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
                    attach: function(node) {
                        var n = node.querySelector('[data-attach="table"]');
                        if (n !== null) {
                            $(n).dataTable(tableSettings);
                        }
                    }
                }
            };
        }

        function render() {
            return workspace.get_func_info(functionId)
                .then(function(data) {
                    var tabs = [
                            { title: 'Overview', id: 'overview', content: overviewTab },
                            { title: 'Spec-file', id: 'spec', content: specFileTab },
                            { title: 'Sub-types', id: 'subs', content: subTypesTab },
                            { title: 'Versions', id: 'vers', content: versionsTab }
                        ],
                        id = '_' + html.genId(),
                        widgets = [],
                        content = div([
                            ul({ id: id, class: 'nav nav-tabs' },
                                tabs.map(function(tab) {
                                    var active = (tab.id === 'overview') ? 'active' : '';
                                    return li({ class: active }, a({ href: '#' + tab.id + id, 'data-toggle': 'tab' }, tab.title));
                                })),
                            div({ class: 'tab-content' }, tabs.map(function(tab) {
                                var active = (tab.id === 'overview') ? ' active' : '',
                                    result = tab.content(data),
                                    widgetId;
                                if (typeof result === 'string') {
                                    return div({ class: 'tab-pane in' + active, id: tab.id + id }, tab.content(data));
                                }
                                // This is the emerging widget pattern: Save a list of widgets 
                                // and invoke them after the content is added to the dom,
                                // because they need a real node to render upon.
                                widgetId = html.genId();
                                widgets.push({
                                    id: widgetId,
                                    widget: result.widget
                                });
                                return div({ class: 'tab-pane in' + active, id: tab.id + id }, [
                                    div({ id: widgetId }, [
                                        result.content
                                    ])
                                ]);
                            }))
                        ]);
                    container.innerHTML = content;
                    widgets.forEach(function(widget) {
                        var n = document.getElementById(widget.id);
                        widget.widget.attach(n);
                    });
                    PR.prettyPrint();
                });
        }

        // API

        function attach(node) {
            return Promise.try(function() {
                mount = node;
                container = document.createElement('div');
                mount.appendChild(container);
            });
        }

        function detach() {
            return Promise.try(function() {
                if (mount && container) {
                    mount.removeChild(container);
                    container.innerHTML = '';
                }
            });
        }

        function start(params) {
            return Promise.try(function() {
                container.innerHTML = html.loading();

                // Parse the data type, throwing exceptions if malformed.
                functionId = params.functionid;
                var matched = functionId.match(/^(.+?)-(.+)\.(.+)$/);
                if (!matched) {
                    throw new Error('Invalid function id ' + functionId);
                }
                if (matched.length !== 4) {
                    throw new Error('Invalid function id ' + functionId);
                }

                moduleName = matched[1];
                functionName = matched[2];
                functionVersion = matched[3];

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
        make: function(config) {
            return factory(config);
        }
    };
});