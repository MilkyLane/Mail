document.addEventListener('DOMContentLoaded', function() {


  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  load_mailbox('inbox');
});

function compose_email() {

  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';



  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 
}
function view(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
  
      console.log(email);


      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      
      document.querySelector('#emails-view').innerHTML = `
        <ul class="list-group">
          <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
          <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
          <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
          <li class="list-group-item"><strong>Time:</strong> ${email.timestamp}</li>
          <li class="list-group-item"> ${email.body}</li>
        </ul>
      `;

      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        });
      }

      const aBtn = document.createElement('button');
      aBtn.innerHTML = email.archived ? "Unarchieve" : "Archive";
      aBtn.className = email.archived ? "btn btn-success" : "btn btn-danger";
      aBtn.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive'); });
      });
      document.querySelector('#emails-view').append(aBtn);

      const rBtn = document.createElement('button');
      rBtn.innerHTML = "Reply";
      rBtn.className = "btn btn-info";
      rBtn.addEventListener('click', function() {
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        let s = email.subject;
        if (s.split(' ', 1)[0] !== "Re:") {
          s = "Re: " + s;
        }
        document.querySelector('#compose-subject').value = s;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#emails-view').append(rBtn);
    });
}


function load_mailbox(mailbox) {
  
  
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
     emails.forEach(singleEmail => {
const newE = document.createElement('div');
newE.className = "list-group-item";
newE.innerHTML = `
  <div class="card">
    <div class="card-body p-2">
      <h5 class="card-title mb-1">Subject: ${singleEmail.subject}</h5>
      <p class="card-text mb-1">From: <span class="font-weight-bold">${singleEmail.sender}</span></p>
      <p class="card-text mb-0">${singleEmail.timestamp}</p>
    </div>
  </div>
`;

newE.className = singleEmail.read ? 'list-group-item read' : 'list-group-item unread';



newE.addEventListener('click', function() {
   view(singleEmail.id);
});
document.querySelector('#emails-view').append(newE);

  })

});

}

function send_email(event) {
event.preventDefault();
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;
  console.log(recipients);

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      body: body,
      recipients: recipients,
      subject: subject
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  })

}

