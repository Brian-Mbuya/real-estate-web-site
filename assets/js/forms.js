/* ============================================================
   Reality Kisumu Hub — Form validation helpers
   ------------------------------------------------------------
   The auth forms previously had no validation at all: an empty
   or malformed email produced a session named after whatever
   text happened to be in the box.

   Errors are announced through aria-invalid + aria-describedby
   so assistive tech reports them, not just the red text.
   ============================================================ */
(function (window, document) {
    'use strict';

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var MESSAGES = {
        required: 'This field is required',
        email: 'Enter a valid email address, e.g. you@example.com',
        minlength: function (n) { return 'Must be at least ' + n + ' characters'; },
        name: 'Enter your full name (at least 2 characters)'
    };

    function errorEl(input) {
        return document.getElementById(input.id + 'Error');
    }

    function setError(input, message) {
        input.setAttribute('aria-invalid', 'true');
        var box = errorEl(input);
        if (box) {
            var text = box.querySelector('span');
            if (text) text.textContent = message;
            box.classList.add('is-visible');
        }
    }

    function clearError(input) {
        input.removeAttribute('aria-invalid');
        var box = errorEl(input);
        if (box) box.classList.remove('is-visible');
    }

    function checkOne(input, rules) {
        var value = String(input.value || '').trim();

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (rule === 'required' && !value) {
                setError(input, MESSAGES.required);
                return false;
            }
            if (rule === 'email' && value && !EMAIL_RE.test(value)) {
                setError(input, MESSAGES.email);
                return false;
            }
            if (rule === 'name' && value.length < 2) {
                setError(input, MESSAGES.name);
                return false;
            }
            if (rule.indexOf('minlength:') === 0) {
                var min = parseInt(rule.split(':')[1], 10);
                if (value.length < min) {
                    setError(input, MESSAGES.minlength(min));
                    return false;
                }
            }
        }
        clearError(input);
        return true;
    }

    /* Validates every field and returns whether all passed.
       Deliberately checks all of them (rather than short-circuiting)
       so the user sees every problem at once instead of one per submit. */
    function validate(fields) {
        var allValid = true;
        fields.forEach(function (field) {
            if (!checkOne(field.input, field.rules)) allValid = false;

            // Re-validate as the user fixes it, but only after the
            // first failed submit — validating while someone is still
            // typing their first character is hostile.
            if (!field.input.dataset.liveBound) {
                field.input.dataset.liveBound = 'true';
                field.input.addEventListener('input', function () {
                    if (field.input.hasAttribute('aria-invalid')) checkOne(field.input, field.rules);
                });
            }
        });
        return allValid;
    }

    function bindPasswordToggles() {
        document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
            button.addEventListener('click', function () {
                var input = document.getElementById(button.dataset.togglePassword);
                if (!input) return;
                var showing = input.type === 'text';
                input.type = showing ? 'password' : 'text';
                button.textContent = showing ? 'Show' : 'Hide';
                button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
                input.focus();
            });
        });
    }

    window.RKForms = {
        validate: validate,
        bindPasswordToggles: bindPasswordToggles,
        setError: setError,
        clearError: clearError
    };
})(window, document);
