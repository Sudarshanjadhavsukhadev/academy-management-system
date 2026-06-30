import React from "react";
import Calendar from "react-calendar";


function PaymentPopup(props) {
  const {
    paymentStudent,
    paymentDate,
    setPaymentDate,
    studentBatches,
    totalFees,
    paymentAmount,
    setPaymentAmount,
    advanceText,
    setAdvanceText,
    selectedBatch,
    fetchBatchStudents,
    setPaymentStudent,
    setMessagePopup,
    handlePaymentSave,
  } = props;

  return (
    <>
      {paymentStudent && (

        <div className="branch-popup-overlay">

          <div className="branch-popup">



            <h3>Select Payment Date</h3>



            <div

              style={{

                background: "#f8f8f8",

                padding: "15px",

                borderRadius: "10px",

                marginBottom: "15px"

              }}

            >

              <p>

                <strong>Student:</strong> {paymentStudent.name}

              </p>



              <p>

                <strong>Total Activities:</strong> {studentBatches.length}

              </p>



              <p>

                <strong>Total Fees:</strong> ₹{totalFees}

              </p>



              {studentBatches.length > 1 ? (

                <>

                  <label

                    style={{

                      display: "block",

                      marginTop: "12px",

                      marginBottom: "5px"

                    }}

                  >

                    Amount Received

                  </label>



                  <input

                    type="number"

                    value={paymentAmount}

                    onChange={(e) => setPaymentAmount(e.target.value)}

                    placeholder="Enter Amount"

                    style={{

                      width: "100%",

                      padding: "10px",

                      borderRadius: "8px",

                      border: "1px solid #ccc"

                    }}

                  />

                </>

              ) : (

                <p

                  style={{

                    marginTop: "12px",

                    fontWeight: "bold",

                    color: "#16a34a"

                  }}

                >

                  Fees Amount: ₹{paymentStudent.fees}

                </p>

              )}

            </div>



            <div className="payment-calendar">

              <Calendar

                value={paymentDate}

                onChange={(date) => setPaymentDate(date)}

                showNeighboringMonth={false}

              />

            </div>



            <input

              type="text"

              placeholder="Example: Fees Paid Till Dec 2026"

              value={advanceText}

              onChange={(e) => setAdvanceText(e.target.value)}

              style={{

                width: "250px",

                padding: "10px",

                marginTop: "15px",

                borderRadius: "8px",

                border: "1px solid #ddd"

              }}

            />



            <div style={{ marginTop: "15px" }}>



              <button

                className="add-btn"
                onClick={handlePaymentSave}
              >

                Save

              </button>



              <button

                style={{ marginLeft: "10px" }}

                onClick={() => {

                  setPaymentStudent(null)

                  setPaymentDate(null)   // 🔥 VERY IMPORTANT

                }}

              >

                Cancel

              </button>



            </div>



          </div>

        </div>

      )

      }
    </>
  );
}

export default PaymentPopup;