import React, {useRef, useState} from "react";
import {saveStoreFsdProfiles} from "../../actions/local_store_actions.js";
import {getIn} from "formik";
import {Dropdown} from "primereact/dropdown";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import FsdProfileModal from "./fsd_profile.jsx";

const FsdSettingsForm = ({values, handleChange, handleBlur, errors, touched, profiles, refreshProfiles, setFieldValue}) => {
    const [showModal, setShowModal] = useState(false);
    const [modalProfile, setModalProfile] = useState();
    const editProfileIndex = useRef(-1);
    const newProfile = useRef(false);

    const newProfileModal = () => {
        newProfile.current = true;
        setModalProfile({
            profileName: "",
            hostname: "",
            port: 6809,
            networkId: "",
            password: "",
            realName: "",
            protocol: "Classic"
        });
        setShowModal(true);
    }

    const editProfileModal = () => {
        newProfile.current = false;
        const index = profiles.findIndex((prf) => prf.profileName === values.selectedFsdProfile);
        setModalProfile(profiles[index]);
        editProfileIndex.current = index;
        setShowModal(true);
    }

    const excludedProfileNames = () => {
        if (newProfile.current) {
            return profiles.map(prf => prf.profileName);
        }

        return profiles.filter(prf => prf.profileName !== values.selectedFsdProfile).map(prf => prf.name);
    }

    const onSaveProfile = async (values, {resetForm}) => {
        const newProfiles = [...profiles];

        if (newProfile.current) {
            newProfiles.push(values);
        } else {
            newProfiles[editProfileIndex.current] = values;
        }

        await saveStoreFsdProfiles(newProfiles);
        refreshProfiles();
        setFieldValue('selectedFsdProfile', values.profileName);
        setShowModal(false);
        resetForm();
    }

    const onDeleteProfile = async () => {
        const newProfiles = profiles.filter((prf) => prf.profileName !== values.selectedFsdProfile);

        await saveStoreFsdProfiles(newProfiles);
        refreshProfiles();
        setFieldValue('selectedFsdProfile', '');
    }

    const currentProfile = profiles.find((prf) => prf.profileName === values.selectedFsdProfile);

    return (
        <>
            <FsdProfileModal
                show={showModal}
                profile={modalProfile}
                onClose={() => setShowModal(false)}
                excludeProfileNames={excludedProfileNames()}
                onSave={onSaveProfile} />

            <h5 className={"text-xl mt-5"}>FSD Connection</h5>
            <div className={"w-full sm:max-w-150"}>
                <label htmlFor={"fsdFormProfileName"}>Profile</label>
                <div className={"w-full flex gap-2"}>
                    <div className={"grow-1"}>
                        <Dropdown
                            className={"w-full"}
                            id={"fsdFormProfileName"}
                            name={"selectedFsdProfile"}
                            autoCorrect={"off"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.selectedFsdProfile}
                            invalid={getIn(touched, "selectedFsdProfile") && getIn(errors, "selectedFsdProfile")}
                            placeholder={"Select Profile"}
                            options={profiles}
                            optionLabel={"profileName"}
                            optionValue={"profileName"}/>
                    </div>
                    <Button label={"Delete"} type={"button"} severity={"danger"} disabled={!values.selectedFsdProfile} onClick={onDeleteProfile}/>
                    <Button label={"Edit"} type={"button"} disabled={!values.selectedFsdProfile} onClick={editProfileModal}/>
                    <Button label={"New"} type={"button"} onClick={newProfileModal}/>
                </div>
                <FormikPrErrorMessage name={"selectedFsdProfile"}/>
            </div>
            <div className={"w-full grid grid-cols-12 sm:max-w-150 gap-2"}>
                <div className={"col-span-12 sm:col-span-5"}>
                    <label>Hostname</label>
                    <InputText
                        className={"w-full"}
                        value={currentProfile?.hostname ?? ""}
                        disabled={true}
                    />
                </div>
                <div className={"col-span-12 sm:col-span-3"}>
                    <label>Port</label>
                    <InputText
                        className={"w-full"}
                        value={currentProfile?.port ?? 0}
                        disabled={true}
                    />
                </div>
                <div className={"col-span-12 sm:col-span-4"}>
                    <label>Protocol Version</label>
                    <InputText
                        className={"w-full"}
                        value={currentProfile?.protocolRevision ?? ""}
                        disabled={true}/>
                </div>
            </div>
            <div className={"w-full grid grid-cols-3 sm:max-w-150 gap-2 mt-2"}>
                <div className={"col-span-3 sm:col-span-1"}>
                    <label>Real Name</label>
                    <InputText
                        className={"w-full"}
                        value={currentProfile?.realName ?? ""}
                        disabled={true}
                    />
                    <FormikPrErrorMessage name={"realName"}/>
                </div>
                <div className={"col-span-3 sm:col-span-1"}>
                    <label>CID</label>
                    <InputText
                        className={"w-full"}
                        value={currentProfile?.networkId ?? ""}
                        disabled={true}
                    />
                </div>
                <div className={"col-span-3 sm:col-span-1"}>
                    <label>Password</label>
                    <Password
                        className={"w-full"}
                        inputClassName={"w-full"}
                        value={currentProfile?.password ?? ""}
                        feedback={false}
                        toggleMask={true}
                        pt={{iconField: {root: {className: "w-full"}}}}
                        disabled={true}
                    />
                </div>
            </div>
        </>
    )
}

export default FsdSettingsForm;