import { createSampleQuery } from '../support/util';

describe('screenshot', () => {
    const sampleQueries = new Array(3).fill(0).map((_, i) =>
        createSampleQuery(
            `fields @timestamp, @message
| sort @timestamp desc
| limit ${i + 1}`,
            [`/aws/lambda/test-${i}`],
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
                window.localStorage.setItem(
                    'cachedQueryIds',
                    JSON.stringify(['00000000-0000-0000-0000-000000000000'])
                );
                window.localStorage.setItem(
                    '00000000-0000-0000-0000-000000000000',
                    JSON.stringify(
                        new Array(150).fill(0).map((_, index) => [
                            {
                                Field: '@timestamp',
                                Value: '2022-12-27 16:41:21.658',
                            },
                            {
                                Field: '@message',
                                Value: `Some log from app: ${index + 1}`,
                            },
                            {
                                Field: 'RequestId',
                                Value: `00000000-0000-0000-0000-000000000${index
                                    .toString()
                                    .padStart(3, '0')}`,
                            },
                        ])
                    )
                );
            },
        });
    });

    it(
        'should take an automated screenshot of the application successfully',
        {
            scrollBehavior: false,
        },
        () => {
            cy.wait(1000);

            cy.get("div[role='tabpanel']:not([hidden])").within(() => {
                // Should be on the first tab
                cy.contains('00000000-0000-0000-0000-000000000000').should(
                    'be.visible'
                );

                // Scroll down through the logs then scroll back up
                cy.get("div[data-cy='query-title']")
                    .parent()
                    .siblings()
                    .within(() => {
                        cy.get('[data-test-id="virtuoso-scroller"]').scrollTo(
                            0,
                            500,
                            {
                                duration: 2000,
                            }
                        );
                    });

                // Click expand to open up the full list of column data
                cy.contains('Some log from app: 8')
                    .should('be.visible')
                    .parent()
                    .parent()
                    .within(() => {
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@message')
                            )
                            .should('have.length', 1);
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@timestamp')
                            )
                            .should('have.length', 1);
                        cy.contains('expand').click();
                    });

                // Filter so that only message column is displayed
                cy.contains('Some log from app: 8')
                    .should('be.visible')
                    .parent()
                    .parent()
                    .within(() => {
                        cy.wait(1000);
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@timestamp')
                            )
                            .should('have.length', 2);
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@message')
                            )
                            .should('have.length', 2);
                        cy.get('span')
                            .filter(
                                (_, elem) =>
                                    elem.innerText.includes('@message') &&
                                    elem.nextSibling.textContent === 'add'
                            )
                            .next()
                            .click();
                        cy.wait(1000);
                    });

                // Collapse the expanded columns view
                cy.contains('Some log from app: 8')
                    .should('be.visible')
                    .parent()
                    .parent()
                    .within(() => {
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@message')
                            )
                            .should('have.length', 2);
                        cy.get('span')
                            .filter((_, elem) =>
                                elem.innerText.includes('@timestamp')
                            )
                            .should('have.length', 1);
                        cy.contains('collapse').should('be.visible').click();
                        cy.contains('expand').should('be.visible');
                        cy.wait(1000);
                    });

                // Scroll back up
                cy.get("div[data-cy='query-title']")
                    .parent()
                    .siblings()
                    .within(() => {
                        cy.get('[data-test-id="virtuoso-scroller"]').scrollTo(
                            0,
                            0,
                            {
                                duration: 1000,
                            }
                        );
                    });
            });
        }
    );
});
