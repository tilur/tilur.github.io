---
layout:  post
title:   "Using preg_match With A switch()"
excerpt: "A useful trick to incorporate preg_match into your switch statement"
date:    2014-07-25
tags:    "Nerd, php, tips"
---

Recently at work, there came a need to be able to ues a regular expression to match values being used in a switch() statement.

The nature of the switch() was looping through an array of fields and populating a variable that would be used in a template. This is all fine for fields that are statically defined... ie: their name wouldn't ever change and would mean the same thing always and forever. The new need came about, by requiring that information be passed through somehow and the value of the variable is altered, depending on what 'meta' information is contained in the name.

To give it a bit more context for better understanding: said field was being populated with an image, but we needed to provide the dimensions to maintain the aspect ratio, while resizing the image to a supplied size. The field's 'meta' then, contains the dimension to set statically (say, width) and the size of that dimension. This would mean that the other dimension (height...) would be calculated, based on the original size of the image and the defined size of the dimension.

#### The Setup: $fields
<pre class="code">
$fields = array(
    'name',
    'email',
    'image_aspect_width_300',
)
</pre>

#### Implementation: switch()
<pre class="code">
foreach ($fields as $field) {
    switchch ($field) {
        case 'name':
            $value = 'Billy Parsons';
            break;
        case 'email':
            $value = 'billy@parsons.com';
            break;
        case (preg_match('/^image_aspect_(width|height)_(\d+)$/', $field, $dimensions) ? $field : !$field):
            // calculate NEW dimensions based on what was populated in $dimensions from preg_match
            break;
    }
}
</pre>

#### The Breakdown
The basics of what is happening, is we're using a ternary operator to put either the value of `$field` into the case, or `false`. This means that if the regular expression supplied to `preg_match` is found, the case will be comparing 'image_aspect_width_300' to 'image_aspect_width_300' and end up calculating the dimensions. If the expression does not match, 'image_aspect_width_300' compares to false and will not calculate the dimensions.

We're also supplying `$dimensions` to `preg_match`, because we have elements in parenthesis in the regular expression... we want to use these items in our calculation. This is the 'meta' that we're passing through to the processing. If designers need to create a new photo size, while still maintaining the aspect ratio of the image (why wouldn't you want to do that anyway?), they simply need to supply a new field name to the process. The only constraint, is that the field name begins with 'photo_aspect_' and contains either 'width' or 'height' next, followed by a number. Of course there are separators using an underscore, but that should go without saying.

The thing to keep in mind however, is performance. This entirely depends on your implementation, so if you're looping through tonnes of `$fields` and have oodles of `preg_match`'es in there, you might want rethink your process. Otherwise, this can be a handy trick.
