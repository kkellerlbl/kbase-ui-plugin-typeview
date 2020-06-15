define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_lib/html'
],
function (
    ko,
    reg,
    ViewModelBase,
    html
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.typeInfo = ko.pureComputed(() => {
                const [, module, name, major, minor] = /^([^.]+)\.([^-]+)-([^.]+)\.(.*)$/.exec(
                    params.typeInfo().type_def
                );
                return {
                    module, name, major, minor,
                    version: `${major}.${minor}`,
                    moduleVersions: params.typeInfo().module_vers,
                    description: params.typeInfo().description
                };
            });
        }
    }

    const t = html.tag,
        a = t('a'),
        pre = t('pre'),
        table = t('table'),
        thead = t('thead'),
        tr = t('tr'),
        th = t('th'),
        tbody = t('tbody'),
        td = t('td');

    // OVERVIEW Tab
    function buildOverview() {
        return table(
            {
                class: 'table table-striped table-bordered',
                dataBind: {
                    with: 'typeInfo'
                }
                // style: 'margin-left: auto; margin-right: auto'
            },
            [
                tr([
                    th('Type name'),
                    td({
                        dataBind: {
                            text: 'name'
                        },
                        dataKBTesthookField: 'name'
                    })
                ]),
                tr([
                    th('Version'),
                    td({
                        dataBind: {
                            text: 'version'
                        }
                    })
                ]),
                tr([
                    th('Module'),
                    td({
                        dataBind: {
                            text: 'module'
                        },
                        dataKBTesthookField: 'module'
                    })
                ]),
                tr([
                    th('In module version(s)'),
                    td(
                        table(
                            {
                                class: 'table'
                            },
                            [
                                thead(tr([th('Version id'), th('Created on')])),
                                tbody(
                                    {
                                        dataBind: {
                                            foreach: 'moduleVersions'
                                        }
                                    },
                                    tr([
                                        td(
                                            a({
                                                style: {
                                                    fontFamily: 'monospace'
                                                },
                                                dataBind: {
                                                    attr: {
                                                        href: '"/#spec/module/" + $component.typeInfo().module + "-" + $data'
                                                    },
                                                    text: '$data'
                                                }
                                            })
                                        ),
                                        td({
                                            dataBind: {
                                                typedText: {
                                                    value: '$data',
                                                    type: '"date"',
                                                    format: '"MMM D, YYYY [at] h:MMa"'
                                                }
                                            }
                                        })
                                    ])
                                )
                            ]
                        )
                    )
                ]),
                tr([
                    th('Description'),
                    td(
                        pre({
                            style: {
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            },
                            dataBind: {
                                text: '$component.typeInfo().description'
                            }
                        })
                    )
                ])
            ]
        );
    }

    function template() {
        return buildOverview();
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
