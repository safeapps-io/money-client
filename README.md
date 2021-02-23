<p align="center">
    <img src="https://raw.githubusercontent.com/safeapps-io/money-client/master/.repo/promo.png" alt="[safe] money" />
</p>
<p align="center">
    The web app that powers <a href="https://money.safeapps.io/">[safe] money</a> (https://safeapps.io).
</p>
<p align="center">
<a href="https://forum.safeapps.io/">
  <img src="https://raw.githubusercontent.com/safeapps-io/money-client/master/.repo/discourse.svg" alt="Discourse forum"></img>
</a>
<img src="https://raw.githubusercontent.com/safeapps-io/money-client/master/.repo/translation.svg" alt="Translation"></img>
</p>

---

## Security

We see the following purposes in this repository:

1. make builds deterministic for our web project.
2. show how the encryption works in the project and what we do with decrypted data.

Most of the code that handles encryption resides in [crypto folder](./src/services/crypto) and [inviteService file](./src/services/invite/inviteService.ts). We rely heavily on [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

If you have any questions or ideas, please [open a new issue](https://github.com/safeapps-io/money-client/issues/new).

If you found a severe security issue, please [contact us via email](mailto:dkzlv@protonmail.com).
