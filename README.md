# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Easily create a short, shareable URL link"](https://github.com/egrannis/tinyapp/blob/117a25b4f5937e986fb2063845494d923a952f2c/assets/TinyURL.png)

!["View all saved short URLs you created with the option to edit and delete them as needed"](tinyapp/assets/ViewURLs.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Using the Application 

- Create an account by clicking register at the top right of the page. Once registered, you will be automatically logged in.

- Click `"Create New URL"` at the top left of the page to make a new TinyURL. Fill in the URL field with the full URL (including http://) of the URL you want the TinyURL to direct to. Click Submit.

- When logged in, you can view all URLs you created by clicking `"My URLs"` at the top left of the page. If you noticed that you made a mistake with one of your URLs, you can either edit the URL that it directs to by clicking the `Edit` button or delete the shortURL entirely by clicking the `Delete` button.

- Once you have your TinyURL created, you can share it with anyone and they will be able to view the URL you want them to see. `Happy sharing!`
