from . import models


def _reactivate_cron(env):
    """Uninstall hook: give the standard scheduled action back to Odoo."""
    cron = env.ref('mail.ir_cron_module_update_notification', raise_if_not_found=False)
    if cron:
        cron.active = True
