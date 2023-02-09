import { createSampleQuery } from '../support/util';

describe('dashboard', () => {
    const sampleQueries = new Array(3).fill(0).map((_, i) =>
        createSampleQuery(
            `fields @timestamp, @message
| sort @timestamp desc
| limit ${i + 1}`,
            [`/aws/lambda/test-${i}`, `/aws/lambda/test-${i + 1}`],
            `00000000-0000-0000-0000-00000000000${i}`
        )
    );

    beforeEach(() => {
        cy.visit('/', {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    'queryDefs',
                    JSON.stringify(sampleQueries)
                );
            },
        });
    });

    it('should display a tab for each query saved', () => {
        sampleQueries.forEach((sampleQuery, i) => {
            cy.get("div[role='tabpanel']");
            cy.get("div[role='tablist']").within(() => {
                cy.get(`button[data-index='${i}']`)
                    .should(
                        'contain.text',
                        sampleQuery.queryId.slice(0, 20) + '...'
                    )
                    .click();
                cy.root()
                    .parent()
                    .find("div[role='tabpanel']:not([hidden])")
                    .within(() => {
                        if (i > 0) {
                            const prevQuery = sampleQueries[i - 1];
                            cy.contains(prevQuery.queryId).should('not.exist');
                            cy.get("input[type='text']").should(
                                'not.have.value',
                                prevQuery.logGroups[0]
                            );
                            cy.get('textarea').should(
                                'not.have.value',
                                prevQuery.queryPrompt
                            );
                        }
                        cy.contains(sampleQuery.queryId).should('be.visible');
                        cy.contains('Log Groups:')
                            .siblings('div')
                            .should('contain.text', sampleQuery.logGroups[0]);
                        cy.get('textarea').should(
                            'have.value',
                            sampleQuery.queryPrompt
                        );
                    });
            });
        });
    });

    it('should allow user to create a new query by pressing new tab button', () => {
        cy.get('[data-cy="query-title"]').should(
            'contain.text',
            '00000000-0000-0000-0000-000000000000'
        );
        cy.get("div[role='tablist']").within(() => {
            cy.get(`button[data-index='3']`)
                .should('contain.text', '+')
                .click();
            cy.get(`button[data-index='3']`).should(
                'contain.text',
                'New Query'
            );
            cy.get(`button[data-index='4']`).should('contain.text', '+');
        });
        cy.get('[data-cy="query-title"]').should('contain.text', 'New Query');
    });

    // TODO Update this test to get log results from localstack once they implement GetQueryResults for "logs" service
    it('should display results after pressing Run Query button', () => {
        // Intercept the endpoint
        cy.intercept('/query', {
            data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
            status: 'success',
        }).as('query');
        cy.intercept('/results', {
            data: {
                queryResults: [
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:41:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 1',
                        },
                    ],
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:42:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 2',
                        },
                    ],
                ],
                queryStatus: 'Complete',
            },
            status: 'success',
        }).as('results');
        cy.contains('Test message 1').should('not.exist');
        cy.contains('Test message 2').should('not.exist');
        cy.contains('Run query').click();
        cy.wait('@query');
        cy.wait('@results');
        // Assert that the results are shown correctly on-screen
        cy.contains('Test message 1').should('be.visible');
        cy.contains('Test message 2').should('be.visible');
    });

    it('should handle error performing query', () => {
        cy.intercept('/query', {
            statusCode: 400,
            body: {
                status: 'error',
                message: 'mock failure',
            },
        }).as('query');
        cy.contains('Error performing query: mock failure').should('not.exist');
        cy.contains('Run query').click();
        cy.contains('Error performing query: mock failure').should(
            'be.visible'
        );
    });

    it('should handle error getting query results', () => {
        // Intercept the endpoint
        cy.intercept('/query', {
            data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
            status: 'success',
        }).as('query');
        cy.intercept('/results', {
            statusCode: 400,
            body: {
                status: 'error',
                message: 'mock failure',
            },
        }).as('results');
        cy.contains('Test message 1').should('not.exist');
        cy.contains('Test message 2').should('not.exist');
        cy.contains('Run query').click();
        cy.wait('@query');
        cy.wait('@results');
        // Assert that the error shown correctly on-screen
        cy.contains('Error performing query: mock failure').should(
            'be.visible'
        );
        cy.contains('Test message 1').should('not.exist');
        cy.contains('Test message 2').should('not.exist');
    });

    it('should handle failed query execution', () => {
        // Intercept the endpoint
        cy.intercept('/query', {
            data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
            status: 'success',
        }).as('query');
        cy.intercept('/results', {
            statusCode: 200,
            body: {
                data: {
                    queryResults: [],
                    queryStatus: 'Failed',
                },
                status: 'success',
            },
        }).as('results');
        cy.contains('Test message 1').should('not.exist');
        cy.contains('Test message 2').should('not.exist');
        cy.contains('Run query').click();
        cy.wait('@query');
        cy.wait('@results');
        // Assert that the error shown correctly on-screen
        cy.contains('Query failed to execute').should('be.visible');
        cy.contains('Test message 1').should('not.exist');
        cy.contains('Test message 2').should('not.exist');
    });

    it('should handle caching query results when switching tabs', () => {
        cy.intercept('/query', {
            data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
            status: 'success',
        }).as('query');
        cy.intercept('/results', {
            data: {
                queryResults: [
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:41:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 1',
                        },
                    ],
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:42:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 2',
                        },
                    ],
                ],
                queryStatus: 'Complete',
            },
            status: 'success',
        }).as('results');
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('Test message 1').should('not.exist');
            cy.contains('Test message 2').should('not.exist');
            cy.contains('Run query').click();
        });
        cy.wait('@query');
        cy.wait('@results');
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('Test message 1').should('be.visible');
            cy.contains('Test message 2').should('be.visible');
            cy.contains('(cached)').should('not.exist');
        });

        cy.get(`button[data-index='1']`).click();

        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('00000000-0000-0000-0000-000000000001').should(
                'be.visible'
            );

            cy.contains('Test message 1').should('not.exist');
            cy.contains('Test message 2').should('not.exist');
            cy.contains('(cached)').should('not.exist');
        });

        cy.get(`button[data-index='0']`).click();

        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('7e806846-a23b-4188-ba54-9c06d678c47a').should(
                'be.visible'
            );

            cy.contains('Test message 1').should('be.visible');
            cy.contains('Test message 2').should('be.visible');
            cy.contains('(cached)').should('be.visible');
        });
    });

    it('should handle preserving the currently selected tab and its query results when reloading the page', () => {
        cy.get(`button[data-index='1']`).click();

        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('00000000-0000-0000-0000-000000000001').should(
                'be.visible'
            );
        });

        cy.intercept('/query', {
            data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
            status: 'success',
        }).as('query');
        cy.intercept('/results', {
            data: {
                queryResults: [
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:41:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 1',
                        },
                    ],
                    [
                        {
                            Field: '@timestamp',
                            Value: '2020-12-27 16:42:21.658',
                        },
                        {
                            Field: '@message',
                            Value: 'Test message 2',
                        },
                    ],
                ],
                queryStatus: 'Complete',
            },
            status: 'success',
        }).as('results');
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('Test message 1').should('not.exist');
            cy.contains('Test message 2').should('not.exist');
            cy.contains('(cached)').should('not.exist');
            cy.contains('Run query').click();
        });
        cy.wait('@query');
        cy.wait('@results');
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('Test message 1').should('be.visible');
            cy.contains('Test message 2').should('be.visible');
            cy.contains('(cached)').should('not.exist');
        });

        cy.reload();

        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('7e806846-a23b-4188-ba54-9c06d678c47a').should(
                'be.visible'
            );

            cy.contains('Test message 1').should('be.visible');
            cy.contains('Test message 2').should('be.visible');
            cy.contains('(cached)').should('be.visible');
        });
    });

    it('should allow user to select log groups to query from', () => {
        // Intercept log groups result to include some fake groups
        cy.intercept(/\/log_groups\?logGroupPrefix=.*$/, {
            statusCode: 200,
            body: {
                status: 'success',
                data: {
                    logGroups: new Array(10)
                        .fill(0)
                        .map((_, i) => `/aws/lambda/test-${i}`),
                },
            },
        }).as('logGroupQuery');

        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            // Typing only a few letters should not query anything
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .type('qw')
                .siblings('div')
                .should('not.be.visible');

            // Enter in prefix to have the log groups show up
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .clear()
                .type('/aws')
                .siblings('div')
                .should('be.visible')
                .within(() => {
                    new Array(10).fill(0).forEach((_, i) => {
                        const expectedLogGroup = `/aws/lambda/test-${i}`;
                        cy.contains(expectedLogGroup)
                            .should('be.visible')
                            .scrollIntoView();
                        // The first two should be checked already
                        if (i <= 1) {
                            cy.contains(expectedLogGroup).should(
                                'have.attr',
                                'data-checked'
                            );
                        } else {
                            cy.contains(expectedLogGroup).should(
                                'not.have.attr',
                                'data-checked'
                            );
                        }
                    });
                });

            // Verify that there's only two selected log groups at the moment
            cy.contains('Log Groups:')
                .should('be.visible')
                .siblings('div')
                .within(() => {
                    cy.contains('/aws/lambda/test-0').should('be.visible');
                    cy.contains('/aws/lambda/test-1').should('be.visible');
                });

            // Check off a few of these log groups to add them
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .siblings('div')
                .should('be.visible')
                .within(() => {
                    for (let i = 2; i <= 4; i++) {
                        cy.contains(`/aws/lambda/test-${i}`)
                            .should('be.visible')
                            .click();
                    }
                });

            // Verify that the newly checked log groups are selected
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .siblings('div')
                .should('be.visible')
                .within(() => {
                    for (let i = 9; i >= 0; i--) {
                        const expectedLogGroup = `/aws/lambda/test-${i}`;
                        const scrollOffset = {
                            offset: {
                                top: -20,
                                left: 0,
                            },
                        };
                        // The first five should be checked now
                        if (i <= 4) {
                            cy.contains(expectedLogGroup)
                                .scrollIntoView(scrollOffset)
                                .should('have.attr', 'data-checked');
                        } else {
                            cy.contains(expectedLogGroup)
                                .scrollIntoView(scrollOffset)
                                .should('not.have.attr', 'data-checked');
                        }
                    }
                });
            cy.contains('Log Groups:')
                .should('be.visible')
                .siblings('div')
                .within(() => {
                    for (let i = 2; i <= 4; i++) {
                        cy.contains(`/aws/lambda/test-${i}`).should(
                            'be.visible'
                        );
                    }
                });

            // Pressing escape key when in prefix input should close the log groups dialog
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .type('{esc}')
                .siblings('div')
                .should('not.be.visible');

            // Run Query request should include these log groups in its request
            cy.intercept('/query', {
                data: { queryId: '7e806846-a23b-4188-ba54-9c06d678c47a' },
                status: 'success',
            }).as('query');
            cy.contains('Run query').click();

            cy.wait('@query').then((interception) => {
                for (let i = 0; i < 5; i++) {
                    cy.wrap(interception.request.body).should(
                        'include',
                        `/aws/lambda/test-${i}`
                    );
                }
            });

            // User should be able to unselect a log group by clicking X beside it in main view
            cy.contains('/aws/lambda/test-3')
                .should('be.visible')
                .siblings('button')
                .should('contain.text', 'X')
                .click();

            cy.contains('/aws/lambda/test-3').should('not.exist');

            cy.contains('Run query').click();

            cy.wait('@query').then((interception) => {
                for (let i = 0; i < 5; i++) {
                    if (i === 3) {
                        cy.wrap(interception.request.body).should(
                            'not.include',
                            `/aws/lambda/test-${i}`
                        );
                    } else {
                        cy.wrap(interception.request.body).should(
                            'include',
                            `/aws/lambda/test-${i}`
                        );
                    }
                }
            });

            cy.contains('/aws/lambda/test-4').should('be.visible');

            // When searching for log groups, should also be able to unselect a log group by unchecking it from the dropdown
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .clear()
                .type('/aws')
                .siblings('div')
                .should('be.visible')
                .within(() => {
                    cy.contains('/aws/lambda/test-4')
                        .should('be.visible')
                        .scrollIntoView()
                        .click();
                });

            // Clicking anywhere besides the prefix input or the log groups dialog should close the log groups dialog
            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .siblings('div')
                .should('be.visible');

            cy.document().its('body').find('img').should('be.visible').click();

            cy.get("input[name='log-group-prefix']")
                .should('be.visible')
                .siblings('div')
                .should('not.be.visible');

            // Verify that the log group unselected earlier is gone
            cy.contains('/aws/lambda/test-4').should('not.exist');

            cy.contains('Run query').should('be.visible').click();

            cy.wait('@query').then((interception) => {
                for (let i = 0; i < 5; i++) {
                    if (i >= 3 && i <= 4) {
                        cy.wrap(interception.request.body).should(
                            'not.include',
                            `/aws/lambda/test-${i}`
                        );
                    } else {
                        cy.wrap(interception.request.body).should(
                            'include',
                            `/aws/lambda/test-${i}`
                        );
                    }
                }
            });
        });
    });
});
