const API_URL = '/api/students';
const studentTableBody = document.getElementById('student-table-body');
const studentForm = document.getElementById('student-form');
const modal = document.getElementById('modal');
const addStudentBtn = document.getElementById('add-student-btn');
const closeBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const countTotal = document.getElementById('count-total');
const avgGPA = document.getElementById('avg-gpa');

// Fetch and render students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        renderStudents(students);
        updateStats(students);
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

function renderStudents(students) {
    if (students.length === 0) {
        studentTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 3rem; color: #94a3b8;">No records found. Click "+ Add Student" to start.</td></tr>';
        return;
    }

    studentTableBody.innerHTML = students.map(student => `
        <tr>
            <td><strong>${student.name}</strong></td>
            <td>${student.rollNo}</td>
            <td>${student.email}</td>
            <td>${student.department}</td>
            <td><span style="color: #10b981; font-weight: 600;">${student.gpa.toFixed(2)}</span></td>
            <td>
                <button onclick="editStudent('${student._id}')" class="btn-icon" title="Edit">✎</button>
                <button onclick="deleteStudent('${student._id}')" class="btn-icon" title="Delete">🗑</button>
            </td>
        </tr>
    `).join('');
}

function updateStats(students) {
    countTotal.innerText = students.length;
    if (students.length > 0) {
        const totalGPA = students.reduce((sum, s) => sum + s.gpa, 0);
        avgGPA.innerText = (totalGPA / students.length).toFixed(2);
    } else {
        avgGPA.innerText = '0.0';
    }
}

// Form Submission
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('student-id').value;
    const studentData = {
        name: document.getElementById('name').value,
        rollNo: document.getElementById('rollNo').value,
        email: document.getElementById('email').value,
        department: document.getElementById('department').value,
        gpa: parseFloat(document.getElementById('gpa').value)
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            closeModal();
            fetchStudents();
            studentForm.reset();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to save record'));
        }
    } catch (error) {
        console.error('Error saving student:', error);
    }
});

// Delete Record
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// Edit Record
async function editStudent(id) {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        const student = students.find(s => s._id === id);

        if (student) {
            document.getElementById('student-id').value = student._id;
            document.getElementById('name').value = student.name;
            document.getElementById('rollNo').value = student.rollNo;
            document.getElementById('email').value = student.email;
            document.getElementById('department').value = student.department;
            document.getElementById('gpa').value = student.gpa;

            modalTitle.innerText = 'Edit Student Record';
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error fetching student details:', error);
    }
}

// Modal UI Logic
addStudentBtn.onclick = () => {
    studentForm.reset();
    document.getElementById('student-id').value = '';
    modalTitle.innerText = 'Add New Student';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

closeBtn.onclick = closeModal;
window.onclick = (e) => { if (e.target == modal) closeModal(); };

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initial Fetch
fetchStudents();
