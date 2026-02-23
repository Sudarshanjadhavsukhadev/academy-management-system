import { useState } from "react"
import { supabase } from "../../../services/supabase"
import "./OnboardingModal.css"

const courses = [
    {
        name: "Full Stack Development",
        fee: 45000,
        branches: {
            Pune: {
                trainer: "Suresh",
                batches: ["FS-01", "FS-02"]
            },
            Mumbai: {
                trainer: "Rohit",
                batches: ["FS-03"]
            }
        }
    },
    {
        name: "Data Analytics",
        fee: 30000,
        branches: {
            Pune: {
                trainer: "Anita",
                batches: ["DA-01"]
            }
        }
    }
]

function OnboardingModal({ onComplete }) {
    const [step, setStep] = useState(1)
    const [course, setCourse] = useState(null)
    const [branch, setBranch] = useState(null)
    const [batch, setBatch] = useState(null)

    const selectedCourse = courses.find(c => c.name === course)

    const finishOnboarding = async () => {
        await supabase.auth.updateUser({
            data: {
                onboarding_completed: true,
                course,
                branch,
                batch
            }
        })
        onComplete()
    }

    return (
        <div className="onboarding-backdrop">
            <div className="onboarding-card">

                {step === 1 && (
                    <>
                        <h3>Select Course</h3>
                        {courses.map(c => (
                            <button key={c.name} onClick={() => {
                                setCourse(c.name)
                                setStep(2)
                            }}>
                                {c.name}
                            </button>
                        ))}
                    </>
                )}

                {step === 2 && (
                    <>
                        <h3>Select Branch</h3>
                        {Object.keys(selectedCourse.branches).map(b => (
                            <button key={b} onClick={() => {
                                setBranch(b)
                                setStep(3)
                            }}>
                                {b}
                            </button>
                        ))}
                    </>
                )}

                {step === 3 && (
                    <>
                        <h3>Select Batch</h3>
                        {selectedCourse.branches[branch].batches.map(b => (
                            <button key={b} onClick={() => {
                                setBatch(b)
                                setStep(4)
                            }}>
                                {b}
                            </button>
                        ))}
                    </>
                )}

                {step === 4 && (
                    <>
                        <h3>Course Fees</h3>
                        <p>Course: {course}</p>
                        <p>Trainer: {selectedCourse.branches[branch].trainer}</p>
                        <p>Fees: ₹{selectedCourse.fee}</p>

                        <button onClick={() => setStep(5)}>
                            View Invoice
                        </button>
                    </>
                )}

                {step === 5 && (
                    <>
                        <div className="invoice-box">
                            <p><span>Course</span><span>{course}</span></p>
                            <p><span>Branch</span><span>{branch}</span></p>
                            <p><span>Batch</span><span>{batch}</span></p>
                            <p>
                                <span>Trainer</span>
                                <span>{selectedCourse.branches[branch].trainer}</span>
                            </p>
                            <p>
                                <b>Total Fees</b>
                                <b>₹{selectedCourse.fee}</b>
                            </p>
                        </div>

                        <button className="primary-btn" onClick={finishOnboarding}>
                            Proceed to Payment
                        </button>
                    </>
                )}

            </div>
        </div>
    )
}

export default OnboardingModal
