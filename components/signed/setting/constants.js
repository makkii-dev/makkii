const SETTINGS = [
    {
        'title': 'password.title',
        'icon': require('../../../assets/icon_setting_password.png'),
        'route_url': 'signed_setting_password'
    },
    {
        'title': 'recovery_phrase.title',
        'icon': require('../../../assets/icon_setting_recovery.png'),
        'route_url':'signed_setting_recovery'
    },
    {
        'title': 'service_configuration.title',
        'icon': require('../../../assets/icon_server.png'),
        'route_url':'signed_setting_services'
    },
    {
        'title': 'language.title',
        'icon': require('../../../assets/icon_setting_i18n.png'),
        'route_url':'signed_setting_language'
    },
    {
        'title': 'currency.title',
        'icon': require('../../../assets/icon_currency.png'),
        'route_url':'signed_setting_currency'
    },
    {
        'title': 'advanced.title',
        'icon': require('../../../assets/icon_advance.png'),
        'route_url':'signed_setting_advanced'
    },
    {
        'title': 'about.title',
        'icon': require('../../../assets/icon_setting_about.png'),
        'route_url':'signed_setting_about'
    },
]
module.exports={
    SETTINGS,
};
