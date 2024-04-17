const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Initialisez l'application Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/*--------------------| OAUTH |------------------*/
app.post("/connexion", (req, res) => {
  fs.readFile("wsoauth.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.connexion) {
      res.json(jsonData.connexion);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.post("/tokenRefresh", (req, res) => {
  fs.readFile("wsoauth.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.refresh) {
      res.json(jsonData.refresh);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.get("/user", (req, res) => {
  fs.readFile("wsoauth.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.user) {
      res.json(jsonData.user);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.post("/getST", (req, res) => {
  fs.readFile("wsoauth.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.getST) {
      res.json(jsonData.getST);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.get("/photo/:photoToken", (req, res) => {
  //On n'utilise pas le token pour ce serveur, mais il sert a avoir la photo d'une personne et est valide qu'une seul fois
  res.sendFile(path.join(__dirname, "images", "profile.jpg"));
});

app.get("/doc-oauth", (req, res) => {
  fs.readFile("wsoauth.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.endpoints) {
      res.json(jsonData.endpoints);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

/*--------------------| NOTES |------------------*/
app.get("/notes", (req, res) => {
  fs.readFile("wsnotes.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.notes) {
      res.json(jsonData.notes);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.get("/doc-notes", (req, res) => {
  fs.readFile("wsnotes.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.endpoints) {
      res.json(jsonData.endpoints);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

/*--------------------| NOTIFICATION |------------------*/
app.get("/history", (req, res) => {
  fs.readFile("benotifications.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.history) {
      // Filtrer pour exclure les éléments marqués comme supprimés
      const filteredHistory = jsonData.history.filter(
        (item) => !item.isDeleted
      );
      // Envoyer la liste filtrée comme réponse JSON
      res.json(filteredHistory);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.post("/history", (req, res) => {
  const filePath = "benotifications.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (Array.isArray(req.body) && jsonData.history) {
      req.body.forEach((updateItem) => {
        // Trouver l'élément dans le fichier JSON par son ID et le mettre à jour
        const itemIndex = jsonData.history.findIndex(
          (item) => item.id === updateItem.id
        );
        if (itemIndex !== -1) {
          if (updateItem.isAlreadyRead !== undefined) {
            jsonData.history[itemIndex].isAlreadyRead =
              updateItem.isAlreadyRead;
          }
          if (updateItem.isDeleted !== undefined) {
            jsonData.history[itemIndex].isDeleted = updateItem.isDeleted;
          }
        }
      });

      // Réécrire le fichier JSON avec les mises à jour
      fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            res.status(500).send("Erreur lors de la mise à jour du fichier");
            return;
          }
          res.send("Mise à jour réussie");
        }
      );
    } else {
      res.status(400).send("Données invalides");
    }
  });
});

app.get("/actualite", (req, res) => {
  fs.readFile("benotifications.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.actualites) {
      res.json(jsonData.actualites);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.put("/terminal/:fcmRegistrationToken", (req, res) => {
  const topic = "test_topic";
  const tokens = [req.params.fcmRegistrationToken];
  admin
    .messaging()
    .subscribeToTopic(tokens, topic)
    .then((response) => {
      console.log("Successfully subscribed", response);
      res.send("Successfully subscribed");
    })
    .catch((error) => {
      console.log("Error unsubscribing from topic:", error);
    });
});

app.delete("/terminal/:fcmRegistrationToken", (req, res) => {
  const topic = "test_topic";
  const tokens = [req.params.fcmRegistrationToken];
  admin
    .messaging()
    .subscribeToTopic(tokens, topic)
    .then((response) => {
      console.log("Successfully unsubscribed", response);
      res.send("Successfully unsubscribed");
    })
    .catch((error) => {
      console.log("Error unsubscribing from topic:", error);
    });
});

app.get("/doc-notifications", (req, res) => {
  fs.readFile("benotifications.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.endpoints) {
      res.json(jsonData.endpoints);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

//NON APPELLER PAR LILU MAIS POUR FAIRE DES NOTIFS AVEC FCM
app.post("/sendFCM/:fcmRegistrationToken", (req, res) => {
  const {
    title,
    body,
    isAlreadyRead,
    isDeleted,
    date,
    type,
    urlExterne,
    urlActualite,
  } = req.body;

  const registrationToken = req.params.fcmRegistrationToken;

  if (!registrationToken) {
    res.status(400).send("FCM registration token is required.");
    return;
  }

  // Envoyer la notification via Firebase
  admin
    .messaging()
    .sendToDevice(
      [registrationToken],
      {
        data: {
          isDeleted: String(isDeleted),
          date,
          type,
          urlExterne,
          urlActualite,
        },
        notification: {
          title,
          body,
        },
      },
      {
        contentAvailable: true,
        priority: "high",
        mutableContent: true,
      }
    )
    .then((response) => {
      console.log(response);
      // Ajouter la notification à history en cas de succès
      fs.readFile("benotifications.json", "utf8", (err, data) => {
        if (err) {
          console.log(
            "Erreur lors de la lecture du fichier pour mise à jour:",
            err
          );
          // Envoyer une réponse même si l'ajout à l'historique échoue
          res.send(
            "Notification sent successfully but failed to update history."
          );
          return;
        }

        const jsonData = JSON.parse(data);
        if (!jsonData.history) {
          jsonData.history = []; // Assurez-vous que le tableau history existe
        }

        // Ajouter la nouvelle entrée au tableau history
        jsonData.history.push({
          id: Math.floor(Math.random() * 1000001),
          title,
          body,
          isAlreadyRead,
          isDeleted,
          date,
          type,
          urlExterne,
          urlActualite,
        });

        // Créer une copie de 'history' dans 'history-save'
        jsonData["history-save"] = JSON.parse(JSON.stringify(jsonData.history));

        // Réécrire le fichier JSON avec la nouvelle entrée
        fs.writeFile(
          "benotifications.json",
          JSON.stringify(jsonData, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.log("Erreur lors de la mise à jour du fichier:", err);
              // Envoyer une réponse même si l'ajout à l'historique échoue
              res.send(
                "Notification sent successfully but failed to update history."
              );
              return;
            }

            // Envoyer une réponse de succès si tout se passe bien
            res.send("Notification sent successfully and history updated.");
          }
        );
      });
    })
    .catch((error) => {
      console.log("Error sending notification:", error);
      res.status(500).send("Error sending notification.");
    });
});

//NON APPELLER PAR LILU MAIS POUR FAIRE DES NOTIFS AVEC TOPIC
app.post("/sendTOPIC/:topic", (req, res) => {
  const {
    title,
    body,
    isAlreadyRead,
    isDeleted,
    date,
    type,
    urlExterne,
    urlActualite,
  } = req.body;

  const topic = req.params.topic;

  if (!topic) {
    res.status(400).send("topic is required.");
    return;
  }

  // Envoyer la notification via Firebase
  admin
    .messaging()
    .sendToTopic(
      topic,
      {
        data: {
          isDeleted: String(isDeleted),
          date,
          type,
          urlExterne,
          urlActualite,
        },
        notification: {
          title,
          body,
        },
      },
      {
        contentAvailable: true,
        priority: "high",
        mutableContent: true,
      }
    )
    .then((response) => {
      // Ajouter la notification à history en cas de succès
      fs.readFile("benotifications.json", "utf8", (err, data) => {
        if (err) {
          console.log(
            "Erreur lors de la lecture du fichier pour mise à jour:",
            err
          );
          // Envoyer une réponse même si l'ajout à l'historique échoue
          res.send(
            "Notification sent successfully but failed to update history."
          );
          return;
        }

        const jsonData = JSON.parse(data);
        if (!jsonData.history) {
          jsonData.history = []; // Assurez-vous que le tableau history existe
        }

        // Ajouter la nouvelle entrée au tableau history
        jsonData.history.push({
          id: Math.floor(Math.random() * 1000001),
          title,
          body,
          isAlreadyRead,
          isDeleted,
          date,
          type,
          urlExterne,
          urlActualite,
        });

        // Créer une copie de 'history' dans 'history-save'
        jsonData["history-save"] = JSON.parse(JSON.stringify(jsonData.history));

        // Réécrire le fichier JSON avec la nouvelle entrée
        fs.writeFile(
          "benotifications.json",
          JSON.stringify(jsonData, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.log("Erreur lors de la mise à jour du fichier:", err);
              // Envoyer une réponse même si l'ajout à l'historique échoue
              res.send(
                "Notification sent successfully but failed to update history."
              );
              return;
            }

            // Envoyer une réponse de succès si tout se passe bien
            res.send("Notification sent successfully and history updated.");
          }
        );
      });
    })
    .catch((error) => {
      console.log("Error sending notification:", error);
      res.status(500).send("Error sending notification.");
    });
});

//NON APPELLER PAR LILU MAIS RECHARGE L'HISTORY
app.get("/copyHistorySaveToHistory", (req, res) => {
  const filePath = "benotifications.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData["history-save"]) {
      jsonData.history = JSON.parse(JSON.stringify(jsonData["history-save"]));
      fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            res.status(500).send("Erreur lors de la mise à jour du fichier");
            return;
          }
          res.send("Copie de 'history-save' dans 'history' réussie");
        }
      );
    } else {
      res.status(400).send("'history-save' n'existe pas");
    }
  });
});

/*--------------------| GEOLOCALISATION |------------------*/
app.get("/lieu", (req, res) => {
  fs.readFile("begeolocalisation.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.lieu) {
      res.json(jsonData.lieu);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.get("/lieu/:id/image", (req, res) => {
  const id = req.params.id;
  const lieuJPG = id + ".jpg";
  res.sendFile(path.join(__dirname, "images", "lieux", lieuJPG));
});

app.get("/doc-geolocalisation", (req, res) => {
  fs.readFile("begeolocalisation.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.endpoints) {
      res.json(jsonData.endpoints);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

/*--------------------| ADE |------------------*/
app.get("/abonnements", (req, res) => {
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.abonnements) {
      res.json(jsonData.abonnements);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.post("/groupes/:groupeId/abonnement", (req, res) => {
  const groupeId = req.params.groupeId;
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }

    const jsonData = JSON.parse(data);
    // Trouver le groupe dans coursGroupes par son ID
    const groupeToAdd = jsonData.coursGroupes.find(
      (groupe) => groupe.id === groupeId
    );
    if (!groupeToAdd) {
      res.status(404).send("Groupe non trouvé.");
      return;
    }
    // Trouver le semestre associé à ce groupe en utilisant fatherId pour faire le lien
    const semestreAssocie = jsonData.semestresCours.find(
      (semestre) => semestre.id === groupeToAdd.fatherId
    );
    // Vérifier si le semestre associé a été trouvé
    if (!semestreAssocie) {
      res.status(404).send("Semestre associé non trouvé.");
      return;
    }

    // Créer un nouvel objet abonnement basé sur le groupe trouvé
    const newAbonnement = {
      id:  Math.floor(Math.random() * (99999 - 1000 + 1) + 1000),
      supannEtuId: "42310609",
      idAde: "34295",
      groupeId: groupeToAdd.id,
      annee: 2023,
      libelle: groupeToAdd.name,
      semestre: semestreAssocie.fatherName,
      formation: "Science politique",
      abonnement: true,
    };
    if (!jsonData.abonnements) {
      jsonData.abonnements = [];
    }
    jsonData.abonnements.push(newAbonnement);
    fs.writeFile(
      "wsade.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          res.status(500).send("Erreur lors de la sauvegarde du fichier");
          return;
        }
        res.json(newAbonnement);
      }
    );
  });
});

app.delete("/abonnements/:id", (req, res) => {
  const id = req.params.id;
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (!jsonData.abonnements) {
      res.status(404).send("Le tableau des abonnements est introuvable.");
      return;
    }
    const updatedAbonnements = jsonData.abonnements.filter(
      (abonnement) => abonnement.id != id
    );
    if (jsonData.abonnements.length === updatedAbonnements.length) {
      res
        .status(404)
        .send("Aucun abonnement correspondant trouvé pour désabonnement.");
      return;
    }
    jsonData.abonnements = updatedAbonnements;
    fs.writeFile(
      "wsade.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          res.status(500).send("Erreur lors de la sauvegarde du fichier");
          return;
        }

        res.send("Désabonnement réussi.");
      }
    );
  });
});

app.get("/semestres", (req, res) => {
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.semestres) {
      res.json(jsonData.semestres);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

app.get("/semestres/:id/cours", (req, res) => {
  const semestreId = req.params.id;
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.semestresCours) {
      // Filtrer pour trouver tous les cours associés à l'ID du semestre
      const coursDuSemestre = jsonData.semestresCours.filter(
        (cours) => cours.fatherId === semestreId
      );
      // Vérifier si des cours ont été trouvés pour le semestre spécifié
      if (coursDuSemestre.length > 0) {
        res.json(coursDuSemestre);
      } else {
        res.status(404).send("Aucun cours trouvé pour ce semestre");
      }
    } else {
      res.status(404).send("Données de semestre non trouvées");
    }
  });
});

app.get("/cours/:id/groupes", (req, res) => {
  const coursId = req.params.id;
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.coursGroupes) {
      // Filtrer pour trouver tous les cours associés à l'ID du semestre
      const groupesDuCours = jsonData.coursGroupes.filter(
        (cours) => cours.fatherId === coursId
      );
      // Vérifier si des cours ont été trouvés pour le semestre spécifié
      if (groupesDuCours.length > 0) {
        res.json(groupesDuCours);
      } else {
        res.status(404).send("Aucun cours trouvé pour ce semestre");
      }
    } else {
      res.status(404).send("Données de semestre non trouvées");
    }
  });
});

app.get("/planning/period/from/:deb/to/:fin", (req, res) => {
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);

    if (jsonData.planning) {
      // Obtenir le mois courant
      const currentMonth = new Date().getMonth() + 1;
      jsonData.planning.forEach((event) => {
        // Extraire l'année et le jour de la date de l'événement
        const eventDate = new Date(event.date.split("/").reverse().join("-"));
        const year = eventDate.getFullYear();
        const day = eventDate.getDate();
        // Mettre à jour la date de l'événement pour qu'elle ait le mois courant
        event.date = [
          ("0" + day).slice(-2), // Ajoute un zéro devant si nécessaire et prend les deux derniers chiffres
          ("0" + currentMonth).slice(-2),
          year,
        ].join("/");
      });

      res.json(jsonData.planning);
    } else {
      res.status(404).send("Données de planning non trouvées");
    }
  });
});

app.get("/doc-ade", (req, res) => {
  fs.readFile("wsade.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture du fichier");
      return;
    }
    const jsonData = JSON.parse(data);
    if (jsonData.endpoints) {
      res.json(jsonData.endpoints);
    } else {
      res.status(404).send("Données de connexion non trouvées");
    }
  });
});

/*--------------------| EPRESENCE |------------------*/

app.post("/qrcode/validation", (req, res) => {
  res.send("Successfully read");
});

/*------------------| LAUNCH SERVER |----------------*/

const PORT = process.env.PORT || 3000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
