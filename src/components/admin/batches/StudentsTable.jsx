import React from "react";
import { supabase } from "../../../services/supabase";
function StudentsTable(props) {
  const {
    activeStudents,
    searchStudent,
    formatDate,
    selectedBatch,
    getNextDueDate,
    setPaymentStudent,
    setPaymentDate,
    setStudentBatches,
    setTotalFees,
    setPaymentAmount,
    fetchStudentAttendanceCalendar,
    setViewStudent,
    setEditingStudent,
    toggleStudentStatus,
    fetchBatchStudents,
  } = props;

  return (
    <>
    
      <div className="students-list">

        <h3>Students Enrolled</h3>

        {activeStudents.length === 0 ? (
          <p>No students in this batch</p>
        ) : (
          <table className="students-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Joining Date</th>
                <th>Fees Assigned</th>

                <th>Paid On</th>
                <th>Last Paid</th>
                <th>Next Due</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {activeStudents.map((student) => (
                <tr
                  id={`student-${student.id}`}
                  key={student.id}
                  className={
                    searchStudent?.id === student.id
                      ? "highlight-student"
                      : student.status === "disabled"
                        ? "disabled-row"
                        : (
                          !student.payment_reset &&
                          student.fees_status === "Paid"
                        )
                          ? "paid-row"
                          : ""
                  }
                >

                  <td>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >

                      <span>{student.name}</span>

                      {student.advance_note && (
                        <small
                          style={{
                            color: "#22c55e",
                            fontWeight: "600",
                            marginTop: "4px"
                          }}
                        >
                          {student.advance_note}
                        </small>
                      )}

                    </div>

                  </td>

                  <td>{formatDate(student.join_date)}</td>

                  <td>{student.fees || "-"}</td>



                  <td>
                    <button
                      className="mark-fees-btn"
                      disabled={student.status === "disabled"}
                      onClick={() => {

                        setPaymentStudent(student);

                        setPaymentDate(new Date());

                        const batches = student.batch_list || [student.batch];

                        setStudentBatches(batches);

                        const total =
                          batches.length *
                          Number(
                            student.batch_fees?.[selectedBatch.name] ||
                            student.fees ||
                            0
                          );

                        setTotalFees(total);

                        // Admin can edit this amount
                        setPaymentAmount(total.toString());

                      }}
                    >
                      Mark Fees
                    </button>
                  </td>
                  <td>
                    {student.advance_note
                      ? "-"
                      : (
                        student.payment_reset
                          ? "-"
                          : formatDate(
                            student.latestFee?.payment_date ||
                            student.last_payment_date
                          )
                      )
                    }
                  </td>
                  <td>

                    {student.advance_note
                      ? "-"
                      : (
                        student.payment_reset
                          ? (
                            (() => {

                              const due = getNextDueDate(student)

                              if (!due) return "-"

                              const today = new Date()

                              due.setHours(0, 0, 0, 0)
                              today.setHours(0, 0, 0, 0)

                              // ✅ overdue students should still show due
                              if (today > due) {
                                return formatDate(due)
                              }

                              // ✅ future due students hidden
                              return "-"

                            })()
                          )
                          : (
                            student.last_payment_date
                              ? formatDate(getNextDueDate(student))
                              : "-"
                          )
                      )
                    }

                  </td>
                  <td className="action-buttons">

                    {student.advance_note && (
                      <button
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                        onClick={async () => {
                          await supabase
                            .from("students")
                            .update({
                              advance_note: null,
                              last_payment_date: null,
                              fee_month: null,
                              fees_status: null,
                              payment_reset: false
                            })
                            .eq("id", student.id)

                          fetchBatchStudents(selectedBatch.name)
                        }}
                      >
                        Remove Note
                      </button>
                    )}

                    <button
                      className="view-btn"
                      onClick={() => {
                        setViewStudent(student)
                        fetchStudentAttendanceCalendar(student.id)
                      }}
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        setEditingStudent({
                          ...student,

                          activity: (() => {
                            if (Array.isArray(student.activity)) {
                              return student.activity;
                            }

                            if (typeof student.activity === "string") {
                              try {
                                const parsed = JSON.parse(student.activity);

                                if (Array.isArray(parsed)) {
                                  return parsed;
                                }

                                return [student.activity];
                              } catch {
                                return [student.activity];
                              }
                            }

                            return [];
                          })(),

                          batch_list: (() => {
                            if (Array.isArray(student.batch_list)) {
                              return student.batch_list;
                            }

                            if (typeof student.batch_list === "string") {
                              try {
                                const parsed = JSON.parse(student.batch_list);

                                if (Array.isArray(parsed)) {
                                  return parsed;
                                }

                                return [student.batch_list];
                              } catch {
                                return [student.batch_list];
                              }
                            }

                            return student.batch ? [student.batch] : [];
                          })(),
                        })
                      }
                    >
                      Edit
                    </button>

                  </td>


                  <td>
                    {(() => {
                      const status = student.status?.toLowerCase().trim()

                      return (
                        <button
                          className={status === "active" ? "active-btn" : "disable-btn"}
                          onClick={() => toggleStudentStatus(student)}
                        >
                          {status === "active" ? "Active" : "Disabled"}
                        </button>
                      )
                    })()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </>
  );
}

export default StudentsTable;