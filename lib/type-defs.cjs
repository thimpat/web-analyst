/**
 * @description Object to use with GenServe's internal pipeline implementation
 *
 * A Loggable keeps an entry in the log history
 * Loggable should be used with GenServe instead of the console
 * If it's not used, the plugin may cause the server to crash on errors
 *
 * @type {Class}
 * @property {*} status Informs the logger whether an operation was successful
 * @property {string} message Message related to the event
 * @property {number} lid Log identifier
 */
