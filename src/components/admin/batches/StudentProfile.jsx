import React from "react";
import Calendar from "react-calendar";

function StudentProfile(props) {
  const {
    viewStudent,
    setViewStudent,
    getTileClass,
    getTileContent,
  } = props;

  if (!viewStudent) {
    return null;
  }

  return (
    <div className="branch-popup-overlay">
      <div className="student-profile-popup">

        {/* LEFT SIDE */}
        <div className="student-info">

          <h2>Student Profile</h2>

          <img
            src={viewStudent.profile_photo}
            alt="student"
            className="student-photo"
          />

          <div className="student-details-grid">

            <p><strong>Name:</strong> {viewStudent.name}</p>
            <div>
              <strong>Activity:</strong>

              <div className="selected-activities" style={{ marginTop: "5px" }}>
                {(Array.isArray(viewStudent.activity)
                  ? viewStudent.activity
                  : [viewStudent.activity]
                ).map((act) => (
                  <div key={act} className="activity-chip">
                    {act}
                  </div>
                ))}
              </div>
            </div>

            <p><strong>Branch:</strong> {viewStudent.branch}</p>
            <div>
              <strong>Batches:</strong>

              <div
                className="selected-activities"
                style={{ marginTop: "5px" }}
              >
                {(viewStudent.batch_list || [viewStudent.batch]).map((batch) => (
                  <div
                    key={batch}
                    className="activity-chip"
                  >
                    {batch}
                  </div>
                ))}
              </div>
            </div>

            <p><strong>Joining Date:</strong> {viewStudent.join_date}</p>
            <p><strong>WhatsApp:</strong> {viewStudent["Whatsapp Number"]}</p>

            <p><strong>Fees:</strong> ₹{viewStudent.fees}</p>
            <p><strong>Date of Birth:</strong> {viewStudent.dob}</p>

            <p><strong>Reference:</strong> {viewStudent.reference}</p>
            <p><strong>Status:</strong> {viewStudent.status}</p>

          </div>
          <button
            className="popup-close-btn"
            onClick={() => setViewStudent(null)}
          >
            ✕
          </button>

        </div>

        {/* RIGHT SIDE */}
        <div className="student-chart">

          <h3>Attendance Chart</h3>

          <Calendar
            tileClassName={getTileClass}
            tileContent={getTileContent}
          />

        </div>

      </div>
    </div>
     
    
  );
}

export default StudentProfile;