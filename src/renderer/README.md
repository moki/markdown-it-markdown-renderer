# renderer

`MarkdownRenderer` extends `markdown-it` [Renderer](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/markdown-it/lib/renderer.d.ts) overwriting default behaviour with [custom rules]../rules/README.md)

## Usage

`MarkdownRenderer` can be parametrized with custom rules or in which mode it should be instantiated

### Constructor parameters

```
export type MarkdownRendererParams = {
    customRules?: Renderer.RenderRuleRecord;
    mode?: MarkdownRendererMode;
};
```

#### mode

`MarkdownRenderer` has two instance modes `MarkdownRendererMode.Production`(default one) and `MarkdownRendererMode.Development`

`MarkdownRendererMode.Development` - provides debug information about rules being called, in the form: `rule <rule_name> called with args <arguments_list>`

#### customRules

`markdown-it` [RenderRuleRecord](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/92075da4b8f7cf6b2bd5ba0299c4337341a56410/types/markdown-it/lib/renderer.d.ts#L7) object
