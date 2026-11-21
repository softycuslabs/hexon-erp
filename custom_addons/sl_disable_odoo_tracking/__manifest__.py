{
    'name': 'Disable Odoo Tracking',
    'version': '19.0.1.0.0',
    'summary': 'Stop the weekly database report sent to services.odoo.com',
    'description': """
Disable Odoo Tracking
=====================
Odoo Community has a hidden scheduled action, "Publisher: Update
Notification", that runs once a week and posts details about the database
to services.odoo.com: database UUID and name, user counts, installed apps,
the server URL, and the company's name, email and phone.

This module:

* turns that scheduled action off, and
* replaces the code it runs so nothing is sent, even if it is run by hand
  or switched back on.

Uninstalling the module switches the scheduled action back on.
    """,
    'category': 'Hidden/Tools',
    'author': 'Softycus Labs',
    'website': 'https://softycus.com',
    'license': 'LGPL-3',
    'depends': ['mail'],
    'data': [
        'data/ir_cron_data.xml',
    ],
    'uninstall_hook': '_reactivate_cron',
    'installable': True,
    'application': False,
    # Installs itself in every database where Discuss/mail is installed.
    'auto_install': True,
}
