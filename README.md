# vscode-ollama README

## Prerequisites

- Download and install [`ollama`](https://ollama.ai)
- Pull the 3 codellama models:
```
ollama pull codellama:13b-instruct
ollama pull codellama:13b-code
ollama pull codellama:13b-python
```

## Features

Both the following modes (Instruct & auto-complete) are triggered using the `Trigger Inline Suggestion` command in VSCode `Cmd + Shift + P`
> _Automatic triggers are not supported_

### Instruct
Trigger `Codellama: Ask` and provide a prompt for instruction based question answering. 
> This uses `codellama:13b-instruct`

### Explain
Trigger `Codellama: Explain` to explain the selected code. If no selection is provided, it will aim to explain the full document
> This uses `codellama:13b-instruct`

### Auto-complete
Write any code and trigger a code completion for it using `Trigger Inline Completion`
> Based on the filetype, it will use `codellama:13b-python` for Python and `codellama:13b-code` for other languages

## Known Issues

When switching languages or models within a session, the initial prompt on a switch can be slow, as the new model needs to be loaded into memory
In case you end up loading all 3 models, you might run out of RAM

## For more information

* [Visual Studio Code's Example for Inline Completion](https://github.com/microsoft/vscode-extension-samples/blob/4721ef0c450f36b5bce2ecd5be4f0352ed9e28ab/inline-completions/src/extension.ts#L11)
* [Implement Busy Indicator in VSCode extension](https://stackoverflow.com/questions/43695200/how-to-implement-a-busy-indicator-in-vscode)

**Enjoy!**
