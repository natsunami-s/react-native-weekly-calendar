import { ActivityIndicator, Modal, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { applyLocale, displayTitleByLocale } from './src/Locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import moment from 'moment/min/moment-with-locales';

import Colors from './src/Colors';
import IconButton from './src/components/IconButton';
import styles from './src/Style';

const WeeklyCalendar = props => {
  const [currDate, setCurrDate] = useState(moment(props.selected).locale(props.locale));
  const [weekdays, setWeekdays] = useState([]);
  const [weekdayLabels, setWeekdayLabels] = useState([]);
  const [selectedDate, setSelectedDate] = useState(currDate.clone());
  const [isCalendarReady, setCalendarReady] = useState(false);
  const [pickerDate, setPickerDate] = useState(currDate.clone());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [cancelText, setCancelText] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [eventMap, setEventMap] = useState(undefined);
  const [scheduleView, setScheduleView] = useState(undefined);
  const [dayViewOffsets, setDayViewOffsets] = useState(undefined);
  const scrollViewRef = useRef();

  useEffect(() => { // only first mount
    applyLocale(props.locale, cancelText => setCancelText(cancelText), confirmText => setConfirmText(confirmText));
    createEventMap(props.events);
    setCalendarReady(true);
  }, []);

  const createEventMap = events => {
    const dateMap = new Map();

    for (let i = 0; i < events.length; i++) {
      const eventDate = moment(events[i].start).format('YYYY-MM-DD').toString();
      if (dateMap.has(eventDate)) {
        const eventArr = dateMap.get(eventDate);
        eventArr.push(events[i]);
        dateMap.set(eventDate, eventArr);
      } else {
        dateMap.set(eventDate, [events[i]]);
      }
    }
    setEventMap(dateMap);
    createWeekdays(currDate, dateMap);
  };

  const createWeekdays = (date, map) => {
    const dayViews = [];
    const offsets = [];
    setWeekdays([]);
    for (let i = 0; i < 7; i++) {
      const currentWeekDayNumber = date.clone().day();
      const monday = moment(date).startOf('isoweek');
      const weekdayToAdd = currentWeekDayNumber === 0 ? date.clone().weekday(- 6 + i) : date.clone().weekday(monday.day() + i);
      setWeekdays(weekdays => [...weekdays, weekdayToAdd]);
      setWeekdayLabels(weekdayLabels => [...weekdayLabels, weekdayToAdd.format(props.weekdayFormat)]);

      // render schedule view
      const events = map.get(weekdayToAdd.format('YYYY-MM-DD').toString());
      let eventViews = [];
      if (events !== undefined) {
        if(props.renderEvent !== undefined) {
          eventViews = events.map((event, j) => {
            if(props.renderFirstEvent !== undefined && j === 0) return props.renderFirstEvent(event, j);
            if(props.renderLastEvent !== undefined && j === events.length - 1) return props.renderLastEvent(event, j);
            return props.renderEvent(event, j);
          });
        } else {
          eventViews = events.map((event, j) => {
            const startTime = moment(event.start).format('LT').toString();
            const duration = event.duration.split(':');
            const seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2]);
            const endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString();
            return (
              <View key={`${i  }-${  j}`}>
                <View style={styles.event}>
                  <View style={styles.eventDuration}>
                    <View style={styles.durationContainer}>
                      <View style={styles.durationDot} />
                      <Text style={styles.durationText}>{startTime}</Text>
                    </View>
                    <View style={{ paddingTop: 10 }} />
                    <View style={styles.durationContainer}>
                      <View style={styles.durationDot} />
                      <Text style={styles.durationText}>{endTime}</Text>
                    </View>
                    <View style={styles.durationDotConnector} />
                  </View>
                  <View style={styles.eventNote}>
                    <Text style={styles.eventText}>{event.note}</Text>
                  </View>
                </View>
                {j < events.length - 1 && <View style={styles.lineSeparator} />}
              </View>
            );
          });
        }
      }

      let dayView;
      if (props.renderDay !== undefined) {
        if (props.renderFirstDay !== undefined && i === 0) dayView = props.renderFirstDay(eventViews, weekdayToAdd, i);
        else if (props.renderLastDay !== undefined && i === 6) dayView = props.renderLastDay(eventViews, weekdayToAdd, i);
        else dayView = props.renderDay(eventViews, weekdayToAdd, i);
      } else {
        dayView = (
          <View key={i.toString()} style={styles.day} onLayout={event => { offsets[i] = event.nativeEvent.layout.y; }}>
            <View style={styles.dayLabel}>
              <Text style={[styles.monthDateText, { color: props.themeColor }]}>{weekdayToAdd.format('M/D').toString()}</Text>
              <Text style={[styles.dayText, { color: props.themeColor }]}>{weekdayToAdd.format(props.weekdayFormat).toString()}</Text>
            </View>
            <View style={[styles.allEvents, eventViews.length === 0 ? { width: '100%', backgroundColor: 'lightgrey' } : {}]}>
              {eventViews}
            </View>
          </View>
        );
      }
      dayViews.push(dayView);
    }
    setScheduleView(dayViews);
    setDayViewOffsets(offsets);
  };

  const clickLastWeekHandler = () => {
    setCalendarReady(false);
    const lastWeekCurrDate = currDate.subtract(7, 'days');
    setCurrDate(lastWeekCurrDate.clone());
    setSelectedDate(lastWeekCurrDate.clone().weekday(props.startWeekday - 7));
    createWeekdays(lastWeekCurrDate.clone(), eventMap);
    setCalendarReady(true);
    props.onWeekChange(lastWeekCurrDate.clone());
  };

  const clickNextWeekHandler = () => {
    setCalendarReady(false);
    const nextWeekCurrDate = currDate.add(7, 'days');
    setCurrDate(nextWeekCurrDate.clone());
    setSelectedDate(nextWeekCurrDate.clone().weekday(props.startWeekday - 7));
    createWeekdays(nextWeekCurrDate.clone(), eventMap);
    setCalendarReady(true);
    props.onWeekChange(nextWeekCurrDate.clone());
  };

  const isSelectedDate = date => {
    if(props.multiselect) {
      return !!props.selectedDates.find(item => dayjs(date).isSame(item, 'date'));
    }

    return dayjs(date).isSame(selectedDate);
  };

  const isPreselectedDate = date => {
    if(props.multiselect) {
      return !!props.preselectedDates.find(item => dayjs(date).isSame(item, 'date'));
    }

    return false;
  };

  const pickerOnChange = (_event, pickedDate) => {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
      setLoading(true);
      if (pickedDate !== undefined) { // when confirm pressed
        setTimeout( () => {
          const pickedDateMoment = moment(pickedDate).locale(props.locale);
          setPickerDate(pickedDateMoment);
          confirmPickerHandler(pickedDateMoment);
          setLoading(false);
        }, 0);
      } else setLoading(false);
    }
    else setPickerDate(moment(pickedDate).locale(props.locale));
  };

  const confirmPickerHandler = pickedDate => {
    setCurrDate(pickedDate);
    setSelectedDate(pickedDate);

    setCalendarReady(false);
    createWeekdays(pickedDate, eventMap);
    setCalendarReady(true);

    setPickerVisible(false);
  };

  const onDayPress = (weekday, i) => {
    // scrollViewRef.current.scrollTo({ y: dayViewOffsets[i], animated: true });
    setSelectedDate(weekday.clone());
    if (props.onDayPress !== undefined) props.onDayPress(weekday.clone(), i);
  };

  const getIsBeforeMinDate = (date) =>  dayjs(date).isBefore(props.minDate, 'date');

  return (
    <View style={[styles.component, props.style]}>
      <View style={styles.header}>
        <IconButton
          containerStyle={styles.arrowButton}
          iconName="chevron-left"
          type="Feather"
          iconSize={25}
          iconColor={Colors.gray}
          disabled={props.arrowsDisabled}
          onPress={clickLastWeekHandler}
        />
        <TouchableOpacity disabled={props.disabled} onPress={() => setPickerVisible(true)}>
          <Text style={[styles.title, props.titleStyle]}>{isCalendarReady && displayTitleByLocale(props.locale, selectedDate, props.titleFormat)}</Text>
        </TouchableOpacity>
        <IconButton
          containerStyle={styles.arrowButton}
          iconName="chevron-right"
          type="Feather"
          iconSize={26}
          iconColor={Colors.gray}
          disabled={props.arrowsDisabled}
          onPress={clickNextWeekHandler}
        />
      </View>
      <View style={styles.week}>
        <View style={styles.weekdayLabelContainer}>
          {
            weekdayLabels.slice(0, 7).map((item, index) => (
              <View style={styles.weekdayLabel} key={index}>
                <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[index] : ''}</Text>
              </View>
            ))
        }
        </View>
        <View style={styles.weekdayNumberContainer}>
          {
            weekdays.map((item, index) => (
              <TouchableOpacity
                style={styles.weekDayNumber}
                onPress={() => onDayPress(item, index)}
                key={index}
                disabled={props.disabled || getIsBeforeMinDate(item)}
              >
                <View style={[styles.weekDayNumberCircle, isPreselectedDate(item) && styles.preselectedWeekdayCircle, isCalendarReady && isSelectedDate(item) && [styles.selectedWeekdayCircle, props.selectedDayStyle]]}>
                  <Text style={[styles.weekDayNumberText, isPreselectedDate(item) && styles.preselectedWeekdayNumberText, isCalendarReady && isSelectedDate(item) && styles.weekDayNumberTextToday, getIsBeforeMinDate(item) && styles.disabledWeekDayNumberText, props.dayNumberStyle]}>
                    {isCalendarReady ? item.date() : ''}
                  </Text>
                </View>
                {isCalendarReady && eventMap.get(item.format('YYYY-MM-DD').toString()) !== undefined &&
                  <View style={isSelectedDate(item) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />}
              </TouchableOpacity>
            ))
        }
        </View>
      </View>
      {/* <ScrollView ref={scrollViewRef} style={styles.schedule}>
        {(scheduleView !== undefined) && scheduleView}
      </ScrollView> */}
      {Platform.OS === 'ios' && (
      <Modal
        transparent
        animationType='fade'
        visible={isPickerVisible}
        onRequestClose={() => setPickerVisible(false)} // for android only
        style={styles.modal}
      >
        <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
          <View style={styles.blurredArea} />
        </TouchableWithoutFeedback>
        <View style={styles.pickerButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={() => setPickerVisible(false)}>
            <Text style={styles.modalButtonText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={confirmPickerHandler.bind(this, pickerDate)}>
            <Text style={styles.modalButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          locale={props.locale}
          value={pickerDate.toDate()}
          onChange={pickerOnChange}
          style={styles.picker}
        />
      </Modal>
      ) }
      {Platform.OS === 'android' && isPickerVisible && (
      <DateTimePicker
        locale={props.locale}
        value={pickerDate.toDate()}
        display='spinner'
        onChange={pickerOnChange}
      />
      ) }
      {(!isCalendarReady || isLoading) && <ActivityIndicator size='large' color='grey' style={styles.indicator} />}
    </View>
  );

};

WeeklyCalendar.propTypes = {
  /** initially selected day */
  selected: PropTypes.any,
  /** If firstDay = 1, week starts from Monday. If firstDay = 7, week starts from Sunday. */
  selectedDates: PropTypes.any,
  preselectedDates: PropTypes.any,
  minDate: PropTypes.any,
  multiselect: PropTypes.bool,
  arrowsDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  startWeekday: PropTypes.number,
  /** Set format to display title (e.g. titleFormat='MMM YYYY' displays "Jan 2020") */
  titleFormat: PropTypes.string,
  /** Set format to display weekdays (e.g. weekdayFormat='dd' displays "Mo" and weekdayFormat='ddd' displays "Mon") */
  weekdayFormat: PropTypes.string,
  /** Set locale (e.g. Korean='ko', English='en', Chinese(Mandarin)='zh-cn', etc.) */
  locale: PropTypes.string,
  /** Set list of events you want to display below weekly calendar.
     * Default is empty array []. */
  events: PropTypes.array,
  /** Specify how each event should be rendered below weekly calendar. Event & index are given as parameters. */
  renderEvent: PropTypes.func,
  /** Specify how first event should be rendered below weekly calendar. Event & index are given as parameters. */
  renderFirstEvent: PropTypes.func,
  /** Specify how last event should be rendered below weekly calendar. Event & index are given as parameters. */
  renderLastEvent: PropTypes.func,
  /** Specify how day should be rendered below weekly calendar. Event Views, day (Moment object), index are given as parameters. */
  renderDay: PropTypes.func,
  /** Specify how first day should be rendered below weekly calendar. Event Views, day (Moment object), index are given as parameters. */
  renderFirstDay: PropTypes.func,
  /** Specify how last day should be rendered below weekly calendar. Event Views, day (Moment object), index are given as parameters. */
  renderLastDay: PropTypes.func,
  /** Handler which gets executed on day press. Default = undefined */
  onDayPress: PropTypes.func,
  onWeekChange: PropTypes.func,
  /** Set theme color */
  themeColor: PropTypes.string,
  /** Set style of component */
  style: PropTypes.any,
  /** Set text style of calendar title */
  titleStyle: PropTypes.any,
  /** Set text style of weekday labels */
  dayLabelStyle: PropTypes.any,
  dayNumberStyle: PropTypes.any,
  dayStyle: PropTypes.any,
  selectedDayStyle: PropTypes.any,
};

WeeklyCalendar.defaultProps = { // All props are optional
  selected: moment(),
  selectedDates: [],
  preselectedDates: [],
  minDate: '',
  multiselect: false,
  arrowsDisabled: false,
  disabled: false,
  startWeekday: 7,
  titleFormat: undefined,
  weekdayFormat: 'ddd',
  locale: 'en',
  events: [],
  renderEvent: undefined,
  renderFirstEvent: undefined,
  renderLastEvent: undefined,
  renderDay: undefined,
  renderFirstDay: undefined,
  renderLastDay: undefined,
  onDayPress: undefined,
  onWeekChange: () => {},
  themeColor: '#46c3ad',
  style: {},
  titleStyle: {},
  dayLabelStyle: {},
  dayNumberStyle: {},
  dayStyle: {},
  selectedDayStyle: {},
};

export default WeeklyCalendar;