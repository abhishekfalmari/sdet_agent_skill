export interface {{pascalCase entityName}}Data {
  {{#each fields}}
  {{camelCase name}}: {{type}};
  {{/each}}
}

export const {{camelCase entityName}}TestData: {{pascalCase entityName}}Data[] = [
  {{#each dataSets}}
  {
    {{#each fields}}
    {{camelCase name}}: {{value}},
    {{/each}}
  },
  {{/each}}
];

// Helper to get test data by key
export function get{{pascalCase entityName}}Data(key: string): {{pascalCase entityName}}Data | undefined {
  return {{camelCase entityName}}TestData.find(d => d.{{camelCase primaryKey}} === key);
}
