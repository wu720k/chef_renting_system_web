# Chef_Renting_System_Web

A Gourmet Moments weboldala és a séfbérlő frontend, egyetlen Angular 18 projektben (standalone komponensek, SCSS, Bootstrap 5 CSS). IDE: Visual Studio Code. A teljes környezet telepítési útmutatója: `../TELEPITES_ES_FUTTATAS.md`.

## Futtatás

1. Indítsa el az API-t (a séfbérlés elküldéséhez kell): `Chef_Renting_System_API`, lásd annak README-jét (http://localhost:8080).
2. A `Chef_Renting_System_Web` mappában:

        npm install        # csak az első alkalommal
        npm start          # vagy: ng serve

3. Böngészőben: http://localhost:4200/ (főoldal), http://localhost:4200/seferek (séfbérlés).

Az oldal az API nélkül is elindul: a főoldal és a séflista működik, csak a foglalás elküldése ad "A szerver nem érhető el" hibaüzenetet.

Egyéb parancsok:

    npm run build                                         # éles fordítás (dist/)
    npm test                                              # tesztek (Chrome szükséges, figyelő módban)
    npx ng test --watch=false --browsers=ChromeHeadless   # egyszeri futtatás

Követelmény: Node.js 20 LTS (vagy 18.19+/22+) és npm.

## Oldalak és működés

| Útvonal | Tartalom |
|---|---|
| `/` | az eredeti főoldal (hero, Rólunk, Séfek) |
| `/seferek` | Séf Bérlés: naptár, séfkártyák, foglalás |

**Foglalás menete** (a `resources/chef_renting_patterns` képek szerint):

1. A navbar "Séf Bérlés" menüpontjával nyissa meg a listát.
2. A naptárban jelölje ki az első és az utolsó napot (a holnap előtti napok le vannak tiltva; a kezdő- és a záró nap is számít).
3. A kártyán kattintson a **Lefoglalom** gombra: a kiválasztott séf "A Séf" sorban jelenik meg (**Eltávolít** gombbal törölhető), becsült végösszeggel.
4. **Foglalás elküldése**: POST `/api/berlesek`. Sikeres foglalásnál "Sikeres foglalás / Jó étvágyat kívánunk!", hibánál "Sikertelen foglalás" és a szerver magyar hibaüzenete látszik (túl rövid/hosszú időszak, érvénytelen kezdő dátum, foglalt séf). Küldés közben a gomb le van tiltva, így nem lehet duplán elküldeni.

A kérés törzse: `{ uid: 101, chefId: <a séf id-ja>, startDate, endDate, dailyRate, baseFee }` (nincs `id` és `totalPrice`, azt a szerver adja/számolja). A `uid` fix érték (nincs bejelentkezés), a `dailyRate` és a `baseFee` a séf adataiból jön ("Napi díj", "Alap Díj").

**Keresés:** a navbar keresőmezője gépelés közben azonnal szűri a séflistát név és konyha szerint (kis-nagybetűtől és a széleken lévő szóközöktől függetlenül). Más oldalról gépelve a séflistára vált. Törléskor újra az összes séf látszik, találat nélkül üzenet jelenik meg.

## Kapcsolat az API-val

- Beállítások: `src/environments/environment.development.ts` (fejlesztés, `npm start`) és `src/environments/environment.ts` (éles `ng build`): `apiBaseUrl`, `chefsUrl`, `userId`. A komponensek nem tartalmaznak beégetett URL-t, a hívások a `RentalService` és a `ChefService` osztályokon mennek át.
- Fejlesztés közben az `apiBaseUrl` értéke `/api`, amit a `proxy.conf.json` továbbít a `http://localhost:8080` címre (az `angular.json` serve beállításában szerepel), ezért a böngészőben nincs CORS-probléma, és az Angular bármely porton futhat.
- Az API ezen felül engedélyezi a `http://localhost:4200` eredetet (CORS), az éles build közvetlenül a `http://localhost:8080/api` címet hívja.
- Másik API-port esetén a `proxy.conf.json` `target` mezőjét (és a `environment.ts` `apiBaseUrl` mezőjét) kell átírni.

## Séfadatok forrása

1. **Távoli JSON:** ha az `environment*.ts` fájlokban a `chefsUrl` meg van adva, az alkalmazás onnan tölti be a séfeket. A `normalizeChefs` (`src/app/services/chef.service.ts`) tömböt vagy azonosító szerinti objektumot (Firebase Realtime Database) fogad el, és a következő mezőneveket ismeri fel: `id`/`chefId`, `name`/`chefName`, `cuisine`/`cuisineType`, `description`, `image`/`imageUrl`, `baseFee`, `dailyRate`.
2. **Helyi tartalék:** ha a `chefsUrl` üres, vagy a távoli kérés hibás/üres választ ad, a `src/assets/data/chefs.json` fájl töltődik be (27 séf, a Firebase-adatok másolata; `id`, `name`, `cuisine`, `description`, `image`, `baseFee`, `dailyRate`). Beállított, de nem elérhető URL esetén a lista felett figyelmeztetés látszik. Ha a tartalék sem tölthető be, hibaüzenet és "Újrapróbálom" gomb jelenik meg.

A `chefsUrl` mindkét környezetben: `https://chat-4b282-default-rtdb.europe-west1.firebasedatabase.app/chefs.json`. Az alkalmazás elsődlegesen innen tölti a séfeket; ha a kérés hibát ad, nem érkezik válasz, vagy a válaszban nincs használható séf, a helyi tartalék töltődik be.

A tartalék séfek 1-4. azonosítójú tagjai és fényképei a referencia képernyőképekről valók (kis felbontású kivágások), a többi séf a `src/assets/images/chefs/placeholder.svg` helyi ábrát kapja. A kép hiánya vagy betöltési hibája esetén is ez jelenik meg.

## Szerkezet

    src/app/
      app.component.*, app.routes.ts, app.config.ts
      content/site-content.ts               főoldal szövegei, navigációs linkek
      models/                               Chef, Rental, DateRange
      services/
        chef.service.ts                     betöltés (távoli + tartalék), szűrés
        rental.service.ts                   POST kérés összeállítása, hibaüzenetek
        search.service.ts                   a navbar keresőszövege
      shared/iso-date.ts                    dátum segédfüggvények (yyyy-MM-dd)
      components/navbar, hero-section, info-section, chef-card, date-range-picker
      pages/home, pages/chef-rental
    src/environments/                       API és forrás beállítások
    src/assets/images, src/assets/data      képek, tartalék séfadatok (URL: assets/...)
    src/favicon.ico                         ikon
    proxy.conf.json                         /api -> http://localhost:8080
    ../resources/chef_renting_patterns/     referenciaképek és forras.txt

## Reszponzív viselkedés

- 992 px alatt hamburger menü, 992 px-től teljes navbar a keresőmezővel.
- 768 px alatt a főoldali kép és szöveg egymás alatt van, 768 px-től egymás mellett, váltakozva. A séfkártyák 1, 2, 3 vagy 4 oszlopban jelennek meg a szélességtől függően.
- A kép- és kártyaelemek torzítás és vízszintes túlcsordulás nélkül méreteződnek.

## Tesztek

38 Karma/Jasmine teszt: séfek betöltése (távoli, tartalék, hiba), keresés név és konyha szerint, kis-nagybetű függetlenség, törlés, a foglalási kérés felépítése, sikeres foglalás, a szerver hibaüzenetének megjelenítése, elérhetetlen szerver, dupla küldés megakadályozása, naptár, hamburger menü.

## Megjegyzések

- A referencia képek kis felbontásúak, ezért a kivágott képek (főoldal és a négy séf) is kicsik. Jobb képek esetén csak a `src/assets/images` fájlokat kell cserélni.
- A főoldali hero bekezdés a referencia szerint 768 px alatt nem látszik.
- A `ng build` Bootstrap-ból eredő "2 rules skipped due to selector errors" figyelmeztetése ismert és ártalmatlan.
