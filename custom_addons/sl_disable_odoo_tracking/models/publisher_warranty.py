import logging

from odoo import api, models

_logger = logging.getLogger(__name__)


class PublisherWarrantyContract(models.AbstractModel):
    _inherit = 'publisher_warranty.contract'

    @api.model
    def _get_sys_logs(self):
        """Never contact services.odoo.com; answer as if it had nothing to say."""
        _logger.info("Odoo publisher warranty report skipped (sl_disable_odoo_tracking).")
        return {'messages': []}

    def update_notification(self, cron_mode=True):
        """Do nothing: no data is collected and nothing is sent."""
        return True
