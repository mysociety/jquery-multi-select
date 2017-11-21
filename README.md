# jquery-multi-select

Converts `<select multiple>` elements into dropdown menus with a checkbox for each `<option>`.

## Use this plugin

Assuming HTML markup like this:

    <label for="people">Select people:</label>
    <select id="people" name="people" multiple>
        <option value="alice">Alice</option>
        <option value="bob">Bob</option>
        <option value="carol">Carol</option>
    </select>

You’ll want to run this:

    $('#people').multiSelect();

You can pass a number of options into `.multiSelect()` to customise the HTML output it generates. Eg:

    $('#people').multiSelect({
        containerHTML: '<div class="btn-group">',
        menuHTML: '<div class="dropdown-menu">',
        buttonHTML: '<button class="btn btn-default">',
        menuItemHTML: '<label>',
        activeClass: 'dropdown-menu--open',
        noneText: '-- Choisir --',
        allText: 'Tout le monde'
    });

## See a demo

Run `make demo`, or open `demo/index.html` in your web browser.

## Run the tests

Run `make test`, or open `test/SpecRunner.html` in your web browser.

## Compile minimized version

You'll need the Closure Compiler, which you can get with `brew install
closure-compiler` or directly from Google's website. If you use brew
(or otherwise create a closure-compiler script in your PATH), you can
run `make dist`, or otherwise you can run:
`make dist COMPILER='java -jar path-to-compiler.jar'`.
