define(['kb_knockout/registry', 'kb_knockout/lib/viewModelBase', 'kb_lib/html'], function (reg, ViewModelBase, html) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.typeInfo = params.typeInfo;

            [, this.module, this.name, this.major, this.minor] = /^([^.]+)\.([^-]+)-([^.]+)\.(.*)$/.exec(
                this.typeInfo.type_def
            );

            this.version = this.major + '.' + this.minor;
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
                class: 'table table-striped table-bordered'
                // style: 'margin-left: auto; margin-right: auto'
            },
            [
                tr([
                    th('Type name'),
                    td({
                        dataBind: {
                            text: 'name'
                        }
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
                        }
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
                                            foreach: 'typeInfo.module_vers'
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
                                                        href: '"/#spec/module/" + $component.module + "-" + $data'
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
                                text: 'typeInfo.description'
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
