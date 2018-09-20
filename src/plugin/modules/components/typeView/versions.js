define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_common/html',
    '../table',
    '../typeLink'
], function (
    ko,
    reg,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    TypeLinkComponent
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            [,this.typeId,,, this.version,,] = /^(([^.]+)\.([^-]+))-(([^.]+)\.(.*))$/.exec(params.typeInfo.type_def);

            this.versionsTable = params.typeInfo.type_vers.map((typeId) => {
                const [,typeName, typeVer] = typeId.match(/^(.+?)-(.+?)$/);
                return {
                    name: typeName,
                    version: typeVer,
                    id: typeId
                };
            });

            this.tableDef = {
                style: {
                    maxHeight: '20em',
                    backgroundColor: '#FFF'
                },
                sort: {
                    column: ko.observable('version'),
                    direction: ko.observable('desc')
                },
                rowStyle: {
                    borderBottom: '1px silver solid'
                },
                columns: [
                    {
                        name: 'name',
                        label: 'Type ID',
                        width: 50,
                        component: {
                            name: TypeLinkComponent.name(),
                            // note params interpreted in the context
                            // of the row. So, name is property of the row...
                            params: {
                                name: 'name',
                                id: 'id'
                            }
                        },
                        sort: null
                    },
                    {
                        name: 'version',
                        label: 'Type version',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                // okay, the version is major.minor, which looks enough like
                                // a float that we can just sort like that :)
                                return (parseFloat(b) - parseFloat(a));
                            }
                        },
                        style: {
                            fontFamily: 'monospace'
                        }
                    }
                ]
            };
            this.tableDef.columnMap = this.tableDef.columns.reduce((map, column) => {
                map[column.name] = column;
                return map;
            }, {});

            this.table = ko.observableArray(this.versionsTable);
        }
    }

    const t = html.tag,
        p = t('p'),
        div = t('div');

    function template() {
        return div({
            style: {
                marginTop: '10px',
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        },[
            div([
                p([
                    'This table shows all versions of this type, ',
                    gen.text('typeId'),
                    '.'
                ])
            ]),
            div({
                style: {
                    marginTop: '10px',
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                },
                dataBind: {
                    component: {
                        name: TableComponent.quotedName(),
                        params: {
                            table: 'tableDef',
                            rows: 'table'
                        }
                    }
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});