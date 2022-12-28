import { createSampleQuery } from '../support/util';

describe('log view', () => {
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
                    JSON.stringify([
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
                    ])
                );
            },
        });
    });

    it('should display each result in the log view', () => {
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('Test message 1').should('be.visible');
            cy.contains('Test message 2').should('be.visible');
            cy.contains('(cached)').should('be.visible');
        });
    });

    it('should allow a log result to be expanded and collapsed', () => {
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('collapse').should('not.exist');
            cy.contains('Test message 1')
                .should('be.visible')
                .parent()
                .parent()
                .within(() => {
                    cy.get('span')
                        .filter((_, elem) =>
                            elem.innerText.includes('@message')
                        )
                        .should('have.length', 1);
                    cy.contains('expand').click();
                    cy.get('span')
                        .filter((_, elem) =>
                            elem.innerText.includes('@message')
                        )
                        .should('have.length', 2);
                });
            cy.contains('collapse').should('be.visible').click();
            cy.contains('collapse').should('not.exist');
            cy.contains('Test message 1')
                .should('be.visible')
                .parent()
                .parent()
                .within(() => {
                    cy.get('span')
                        .filter((_, elem) =>
                            elem.innerText.includes('@message')
                        )
                        .should('have.length', 1);
                    cy.contains('expand').should('be.visible');
                });
        });
    });

    it('should allow specified columns to be added/removed to/from filtered view', () => {
        cy.get("div[role='tabpanel']:not([hidden])").within(() => {
            cy.contains('collapse').should('not.exist');
            cy.contains('Test message 1')
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
                    cy.get('span')
                        .filter(
                            (_, elem) =>
                                elem.innerText.includes('@message') &&
                                elem.nextSibling.textContent === 'remove'
                        )
                        .next()
                        .click();
                    cy.get('span')
                        .filter((_, elem) =>
                            elem.innerText.includes('@message')
                        )
                        .should('have.length', 2);
                    cy.get('span')
                        .filter((_, elem) =>
                            elem.innerText.includes('@timestamp')
                        )
                        .should('have.length', 2);
                });
        });
    });
});
