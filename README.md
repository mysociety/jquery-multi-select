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
        placeholderText: '-- Choisir --'
    });

## See a demo

Open `demo/index.html` in your web browser.

## Run the tests

Open `test/SpecRunner.html` in your web browser.
