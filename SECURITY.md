# Sicurezza

## Segnalare una vulnerabilità

Non aprire una issue pubblica. Usa la segnalazione privata di GitHub:
**Security → Report a vulnerability** nella pagina della repo
(https://github.com/N1K1TAS95/dashboard-kit/security/advisories/new).

Risposta indicativa entro qualche giorno. È un progetto personale, senza garanzie di tempi.

## Cosa è coperto

Il kit è solo CSS e JavaScript lato browser, senza dipendenze né richieste di rete.
`kit.js` non usa `innerHTML`, `eval` né script inline, ed è pensato per funzionare con
una Content-Security-Policy rigida.

## Versioni e integrità

- I tag `v*` sono immutabili: la repo ne vieta lo spostamento e la cancellazione.
- Usa sempre una versione fissata nell'URL del CDN e l'attributo `integrity` (SRI)
  riportato nel README. Gli hash si ricalcolano con `./sri.sh`.
- Evita `@main` o `@latest`: non sono immutabili.
