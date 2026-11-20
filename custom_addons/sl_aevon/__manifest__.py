{
    'name': 'Aevon Home Menu',
    'version': '19.0.1.0.0',
    'summary': 'Enterprise-style full-screen app home screen for Odoo 19 Community',
    'description': """
Aevon Home Menu
===============
Replaces the Community apps dropdown with a full-screen home screen of app
icons, like Odoo Enterprise:

* Grid of app icons opened from the navbar apps button (Alt+H)
* Shown by default after login instead of jumping into the first app
* Type to search apps and their menu items
* Keyboard navigation (arrow keys, Enter, Escape)
    """,
    'category': 'Productivity',
    'author': 'Softycus Labs',
    'website': 'https://softycus.com',
    'license': 'LGPL-3',
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'sl_aevon/static/src/**/*',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
